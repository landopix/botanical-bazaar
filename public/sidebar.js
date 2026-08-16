// Sidebar navigation script for The Botanical Bazaar
// Handles opening/closing of the sidebar on mobile, expanding nested groups
// and highlighting the active link based on the current page.

document.addEventListener('DOMContentLoaded', function () {
  var sidebar = document.getElementById('site-sidebar');
  var toggle = document.querySelector('.sidebar-toggle');
  // Toggle sidebar open/close on mobile
  if (toggle && sidebar) {
    toggle.addEventListener('click', function () {
      var isOpen = sidebar.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
      // When toggling the sidebar, also toggle a class on the body so content can slide over
      document.body.classList.toggle('sidebar-open', isOpen);
    });
  }
  // Toggle expandable groups
  var groupToggles = document.querySelectorAll('.group-toggle');
  groupToggles.forEach(function (btn) {
    var targetId = btn.getAttribute('aria-controls');
    var submenu = document.getElementById(targetId);
    if (!submenu) return;
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', (!expanded).toString());
      submenu.classList.toggle('open', !expanded);
    });
  });
  // Highlight active link
  var current = window.location.pathname.split('/').pop() || 'index.html';
  // Remove query parameters if present
  current = current.split('?')[0];
  var links = document.querySelectorAll('#site-sidebar a');
  links.forEach(function (link) {
    if (link.getAttribute('href') === current) {
      link.classList.add('active');
      // If nested, ensure its parent submenu is open
      var parentSubmenu = link.closest('.submenu');
      if (parentSubmenu && !parentSubmenu.classList.contains('open')) {
        parentSubmenu.classList.add('open');
        // Find associated toggle and set aria-expanded
        var toggleId = parentSubmenu.getAttribute('id');
        var parentToggle = document.querySelector('[aria-controls="' + toggleId + '"]');
        if (parentToggle) {
          parentToggle.setAttribute('aria-expanded', 'true');
        }
      }
    }
  });
  // Close sidebar when pressing Esc on mobile
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      // Remove the slide class when closing via Escape key
      document.body.classList.remove('sidebar-open');
    }
  });

  // Ensure the collector's gallery appears in the navigation. Because
  // each page embeds the sidebar markup statically, we add the link
  // programmatically if it doesn't already exist. This reduces
  // duplication across pages and guarantees users can find the
  // gallery from anywhere on the site.
  try {
    // Sidebar insertion
    var sidebarList = document.querySelector('#site-sidebar ul');
    if (sidebarList && !sidebarList.querySelector('a[href="orchids-gallery.html"]')) {
      var li = document.createElement('li');
      var link = document.createElement('a');
      link.href = 'orchids-gallery.html';
      link.textContent = 'Gallery';
      li.appendChild(link);
      // Insert before the first .group if present so the gallery sits
      // above the expandable sections.
      var firstGroup = sidebarList.querySelector('li.group');
      if (firstGroup) {
        sidebarList.insertBefore(li, firstGroup);
      } else {
        sidebarList.appendChild(li);
      }
    }
    // Header nav insertion
    var headerNav = document.querySelector('header nav');
    if (headerNav && !headerNav.querySelector('a[href="orchids-gallery.html"]')) {
      var galleryLink = document.createElement('a');
      galleryLink.href = 'orchids-gallery.html';
      galleryLink.textContent = 'Gallery';
      // Insert before the contact link if it exists for consistent order
      var contactLink = headerNav.querySelector('a[href="contact.html"]');
      if (contactLink) {
        headerNav.insertBefore(galleryLink, contactLink);
      } else {
        headerNav.appendChild(galleryLink);
      }
    }
  } catch (err) {
    console.warn('Failed to insert gallery link into navigation:', err);
  }

  // Insert search input for live menu search
  if (sidebar) {
    var searchInput = document.createElement('input');
    searchInput.id = 'sidebar-search';
    searchInput.type = 'text';
    // Use an ASCII ellipsis to avoid non-ASCII characters in the UI
    searchInput.placeholder = 'Search...';
    searchInput.setAttribute('aria-label', 'Search navigation');
    sidebar.insertBefore(searchInput, sidebar.firstChild);
    searchInput.addEventListener('input', function () {
      var query = searchInput.value.trim().toLowerCase();
      var listItems = sidebar.querySelectorAll('li');
      listItems.forEach(function (li) {
        var matches = false;
        var anchor = li.querySelector('a');
        if (anchor) {
          var text = anchor.textContent.toLowerCase();
          if (query === '' || text.indexOf(query) > -1) {
            matches = true;
          }
        }
        if (li.classList.contains('group')) {
          // check children links
          var childLinks = li.querySelectorAll('ul.submenu a');
          childLinks.forEach(function (cl) {
            var t = cl.textContent.toLowerCase();
            if (query === '' || t.indexOf(query) > -1) {
              matches = true;
            }
          });
        }
        li.style.display = matches ? '' : 'none';
      });
      // Expand all groups when searching
      if (query !== '') {
        groupToggles.forEach(function (btn) {
          var submenu = document.getElementById(btn.getAttribute('aria-controls'));
          if (submenu) {
            btn.setAttribute('aria-expanded', 'true');
            submenu.classList.add('open');
          }
        });
      }
    });
  }

  // Custom Branded Hardiness Zone Modal for static pages
  function initZoneModal() {
    function updateTriggers() {
      var currentZone = localStorage.getItem('user_hardiness_zone') || '10a';
      var triggers = document.querySelectorAll('.zone-pill-btn');
      triggers.forEach(function (btn) {
        btn.textContent = 'Zone ' + currentZone + ' ▾';
      });
    }

    updateTriggers();
    window.addEventListener('user_hardiness_zone_updated', updateTriggers);

    var modalOverlay = document.getElementById('global-zone-modal');
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.id = 'global-zone-modal';
      modalOverlay.className = 'zone-modal-overlay';
      modalOverlay.style.display = 'none';

      var container = document.createElement('div');
      container.className = 'zone-modal-container';

      var header = document.createElement('div');
      header.className = 'zone-modal-header';

      var title = document.createElement('h3');
      title.className = 'zone-modal-title';
      title.textContent = 'Select Your USDA Zone';

      var closeBtn = document.createElement('button');
      closeBtn.className = 'zone-modal-close';
      closeBtn.innerHTML = '✕';
      closeBtn.setAttribute('aria-label', 'Close climate zone modal');
      closeBtn.onclick = function() {
        modalOverlay.style.display = 'none';
      };

      header.appendChild(title);
      header.appendChild(closeBtn);

      var grid = document.createElement('div');
      grid.className = 'zone-modal-grid';

      var zones = [];
      for (var i = 1; i <= 13; i++) {
        zones.push(i + 'a');
        zones.push(i + 'b');
      }

      zones.forEach(function(z) {
        var pill = document.createElement('button');
        var cz = localStorage.getItem('user_hardiness_zone') || '10a';
        pill.className = 'zone-modal-pill' + (cz === z ? ' active' : '');
        pill.textContent = 'Zone ' + z;
        pill.onclick = function() {
          localStorage.setItem('user_hardiness_zone', z);
          window.dispatchEvent(new Event('user_hardiness_zone_updated'));
          modalOverlay.style.display = 'none';
        };
        grid.appendChild(pill);
      });

      container.appendChild(header);
      container.appendChild(grid);
      modalOverlay.appendChild(container);

      modalOverlay.onclick = function(e) {
        if (e.target === modalOverlay) {
          modalOverlay.style.display = 'none';
        }
      };

      document.body.appendChild(modalOverlay);
    }

    function openModal() {
      if (modalOverlay) {
        var cz = localStorage.getItem('user_hardiness_zone') || '10a';
        var pills = modalOverlay.querySelectorAll('.zone-modal-pill');
        pills.forEach(function(p) {
          if (p.textContent === 'Zone ' + cz) {
            p.classList.add('active');
          } else {
            p.classList.remove('active');
          }
        });
        modalOverlay.style.display = 'flex';
      }
    }

    window.addEventListener('open_zone_modal', openModal);

    document.addEventListener('click', function(e) {
      if (e.target && e.target.classList.contains('zone-pill-btn')) {
        e.preventDefault();
        openModal();
      }
    });
  }

  initZoneModal();

});