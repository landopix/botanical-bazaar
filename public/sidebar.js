// Sidebar navigation script for The Botanical Bazaar
// Handles opening/closing of the sidebar on mobile, expanding nested groups
// and highlighting the active link based on the current page.

document.addEventListener('DOMContentLoaded', function () {
  var sidebar = document.getElementById('site-sidebar');
  var toggle = document.querySelector('.sidebar-toggle');
  var triggerBtn = null;

  // Function to open sidebar
  function openSidebar(btn) {
    if (!sidebar) return;
    triggerBtn = btn || toggle || document.activeElement;
    sidebar.classList.add('open');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    sidebar.setAttribute('aria-modal', 'true');
    document.body.classList.add('sidebar-open');
    document.body.style.overflow = 'hidden';

    var searchInput = document.getElementById('sidebar-search');
    if (searchInput) {
      setTimeout(function() { searchInput.focus(); }, 50);
    } else {
      sidebar.focus();
    }
  }

  // Function to close sidebar
  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    sidebar.setAttribute('aria-modal', 'false');
    document.body.classList.remove('sidebar-open');
    document.body.style.overflow = '';

    if (triggerBtn && typeof triggerBtn.focus === 'function') {
      triggerBtn.focus();
    } else if (toggle && typeof toggle.focus === 'function') {
      toggle.focus();
    }
  }

  // Toggle sidebar open/close on mobile and FAB search trigger
  if (sidebar) {
    document.addEventListener('click', function(e) {
      var clickToggle = e.target.closest('.header-mobile-toggle, .sidebar-toggle');
      if (clickToggle) {
        e.preventDefault();
        if (sidebar.classList.contains('open')) {
          closeSidebar();
        } else {
          openSidebar(clickToggle);
        }
        return;
      }

      var backdrop = e.target.closest('.sidebar-backdrop');
      if (backdrop) {
        closeSidebar();
        return;
      }

      if (sidebar.classList.contains('open') && !sidebar.contains(e.target)) {
        closeSidebar();
      }
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
  current = current.split('?')[0];
  var links = document.querySelectorAll('#site-sidebar a');
  links.forEach(function (link) {
    if (link.getAttribute('href') === current) {
      link.classList.add('active');
      var parentSubmenu = link.closest('.submenu');
      if (parentSubmenu && !parentSubmenu.classList.contains('open')) {
        parentSubmenu.classList.add('open');
        var toggleId = parentSubmenu.getAttribute('id');
        var parentToggle = document.querySelector('[aria-controls="' + toggleId + '"]');
        if (parentToggle) {
          parentToggle.setAttribute('aria-expanded', 'true');
        }
      }
    }
    // Automatically close sidebar when link is clicked
    link.addEventListener('click', function() {
      closeSidebar();
    });
  });

  // Close sidebar when pressing Esc key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var zoneModal = document.getElementById('global-zone-modal');
      if (zoneModal && zoneModal.style.display !== 'none') {
        zoneModal.style.display = 'none';
        document.body.style.overflow = '';
        if (triggerBtn && typeof triggerBtn.focus === 'function') {
          triggerBtn.focus();
        }
      } else if (sidebar && sidebar.classList.contains('open')) {
        closeSidebar();
      }
    }
  });

  // Ensure the collector's gallery appears in navigation
  try {
    var sidebarList = document.querySelector('#site-sidebar ul');
    if (sidebarList && !sidebarList.querySelector('a[href="orchids-gallery"]')) {
      var li = document.createElement('li');
      var link = document.createElement('a');
      link.href = 'orchids-gallery.html';
      link.textContent = 'Gallery';
      li.appendChild(link);
      var firstGroup = sidebarList.querySelector('li.group');
      if (firstGroup) {
        sidebarList.insertBefore(li, firstGroup);
      } else {
        sidebarList.appendChild(li);
      }
    }
    var headerNav = document.querySelector('header nav');
    if (headerNav && !headerNav.querySelector('a[href="orchids-gallery"]')) {
      var galleryLink = document.createElement('a');
      galleryLink.href = 'orchids-gallery.html';
      galleryLink.textContent = 'Gallery';
      var contactLink = headerNav.querySelector('a[href="contact"]');
      if (contactLink) {
        headerNav.insertBefore(galleryLink, contactLink);
      } else {
        headerNav.appendChild(galleryLink);
      }
    }
  } catch (err) {
    console.warn('Failed to insert gallery link into navigation:', err);
  }

  // Insert search input for live menu search if not present
  if (sidebar && !document.getElementById('sidebar-search')) {
    var searchInput = document.createElement('input');
    searchInput.id = 'sidebar-search';
    searchInput.type = 'text';
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
        document.body.style.overflow = '';
        if (triggerBtn && typeof triggerBtn.focus === 'function') {
          triggerBtn.focus();
        }
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
          document.body.style.overflow = '';
          if (triggerBtn && typeof triggerBtn.focus === 'function') {
            triggerBtn.focus();
          }
        };
        grid.appendChild(pill);
      });

      container.appendChild(header);
      container.appendChild(grid);
      modalOverlay.appendChild(container);

      modalOverlay.onclick = function(e) {
        if (e.target === modalOverlay) {
          modalOverlay.style.display = 'none';
          document.body.style.overflow = '';
          if (triggerBtn && typeof triggerBtn.focus === 'function') {
            triggerBtn.focus();
          }
        }
      };

      document.body.appendChild(modalOverlay);
    }

    function openModal() {
      if (modalOverlay) {
        triggerBtn = document.activeElement;
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
        document.body.style.overflow = 'hidden';
        var firstPill = modalOverlay.querySelector('button');
        if (firstPill) firstPill.focus();
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
