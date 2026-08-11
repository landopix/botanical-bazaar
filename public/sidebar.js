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

  // Insert search input for live menu search with Lantern Submark link
  if (sidebar) {
    var products = window.PRODUCTS || [];
    if (products.length === 0) {
      var script = document.createElement('script');
      script.src = '/products.js';
      script.onload = function() {
        products = window.PRODUCTS || [];
      };
      document.body.appendChild(script);
    }

    var searchContainer = document.createElement('div');
    searchContainer.className = 'sidebar-search-container';
    searchContainer.style.position = 'relative';

    var submarkLink = document.createElement('a');
    submarkLink.href = '/';
    submarkLink.className = 'sidebar-search-submark-link';
    submarkLink.setAttribute('aria-label', 'Home');

    var submarkImg = document.createElement('img');
    submarkImg.src = '/assets/lantern-submark.png';
    submarkImg.alt = 'Lantern submark';
    submarkImg.className = 'sidebar-search-submark';

    submarkLink.appendChild(submarkImg);
    searchContainer.appendChild(submarkLink);

    var inputWrapper = document.createElement('div');
    inputWrapper.style.position = 'relative';
    inputWrapper.style.flex = '1';
    inputWrapper.style.display = 'flex';
    inputWrapper.style.alignItems = 'center';

    var searchInput = document.createElement('input');
    searchInput.id = 'sidebar-search';
    searchInput.type = 'text';
    searchInput.placeholder = 'Search...';
    searchInput.setAttribute('aria-label', 'Search navigation');
    searchInput.style.width = '100%';
    searchInput.style.paddingRight = '2rem';
    inputWrapper.appendChild(searchInput);

    var clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.style.position = 'absolute';
    clearBtn.style.right = '8px';
    clearBtn.style.background = 'none';
    clearBtn.style.border = 'none';
    clearBtn.style.color = '#D4B06A';
    clearBtn.style.cursor = 'pointer';
    clearBtn.style.fontSize = '1.1rem';
    clearBtn.style.padding = '4px';
    clearBtn.style.lineHeight = '1';
    clearBtn.style.display = 'none';
    clearBtn.textContent = '✕';
    clearBtn.setAttribute('aria-label', 'Clear search');
    inputWrapper.appendChild(clearBtn);

    searchContainer.appendChild(inputWrapper);

    var dropdown = document.createElement('div');
    dropdown.className = 'live-search-dropdown';
    dropdown.style.position = 'absolute';
    dropdown.style.top = '100%';
    dropdown.style.left = '0';
    dropdown.style.width = '100%';
    dropdown.style.backgroundColor = '#00301e';
    dropdown.style.border = '1px solid #D4B06A';
    dropdown.style.borderRadius = '8px';
    dropdown.style.marginTop = '6px';
    dropdown.style.maxHeight = '260px';
    dropdown.style.overflowY = 'auto';
    dropdown.style.zIndex = '1001';
    dropdown.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
    dropdown.style.boxSizing = 'border-box';
    dropdown.style.padding = '0.5rem';
    dropdown.style.display = 'none';
    searchContainer.appendChild(dropdown);

    sidebar.insertBefore(searchContainer, sidebar.firstChild);

    function updateDropdown() {
      var query = searchInput.value.trim().toLowerCase();
      if (!query) {
        clearBtn.style.display = 'none';
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
        return;
      }

      clearBtn.style.display = 'flex';
      dropdown.style.display = 'block';
      dropdown.innerHTML = '';

      var results = products.filter(function (prod) {
        var nameMatch = prod.name && prod.name.toLowerCase().indexOf(query) > -1;
        var typeMatch = prod.type && prod.type.toLowerCase().indexOf(query) > -1;
        var descMatch = prod.description && prod.description.toLowerCase().indexOf(query) > -1;
        var catMatch = Array.isArray(prod.categories) && prod.categories.some(function (c) { return c.toLowerCase().indexOf(query) > -1; });
        return nameMatch || typeMatch || descMatch || catMatch;
      });

      if (results.length > 0) {
        results.forEach(function (prod) {
          var isSoldOut = !prod.quantity || prod.quantity < 3;
          var itemImg = prod.image ? (prod.image.indexOf('http') === 0 || prod.image.indexOf('/') === 0 ? prod.image : '/' + prod.image) : '/assets/placeholder.png';

          var link = document.createElement('a');
          link.href = '/product/' + prod.slug;
          link.style.display = 'flex';
          link.style.alignItems = 'center';
          link.style.gap = '0.8rem';
          link.style.padding = '0.5rem';
          link.style.textDecoration = 'none';
          link.style.color = '#E9DCBE';
          link.style.borderBottom = '1px solid rgba(212, 176, 106, 0.15)';
          link.style.borderRadius = '4px';
          link.style.transition = 'background 0.2s';

          link.addEventListener('mouseenter', function() {
            link.style.backgroundColor = '#1C3D2E';
          });
          link.addEventListener('mouseleave', function() {
            link.style.backgroundColor = 'transparent';
          });

          var img = document.createElement('img');
          img.src = itemImg;
          img.alt = prod.name;
          img.style.width = '40px';
          img.style.height = '40px';
          img.style.objectFit = 'cover';
          img.style.borderRadius = '4px';
          img.style.border = '1px solid rgba(212, 176, 106, 0.3)';
          link.appendChild(img);

          var info = document.createElement('div');
          info.style.flex = '1';
          info.style.textAlign = 'left';
          info.style.minWidth = '0';

          var nameDiv = document.createElement('div');
          nameDiv.style.fontSize = '0.95rem';
          nameDiv.style.fontWeight = 'bold';
          nameDiv.style.color = '#D4B06A';
          nameDiv.style.whiteSpace = 'nowrap';
          nameDiv.style.overflow = 'hidden';
          nameDiv.style.textOverflow = 'ellipsis';
          nameDiv.style.fontFamily = 'Cinzel, serif';
          nameDiv.textContent = prod.name;
          info.appendChild(nameDiv);

          var priceDiv = document.createElement('div');
          priceDiv.style.fontSize = '0.85rem';
          priceDiv.style.color = '#F5E7C4';
          if (isSoldOut) {
            priceDiv.style.color = '#ba2f2f';
            priceDiv.textContent = 'Sold Out';
          } else {
            priceDiv.textContent = '$' + (prod.price ? prod.price.toFixed(2) : '0.00');
          }
          info.appendChild(priceDiv);

          link.appendChild(info);
          dropdown.appendChild(link);
        });
      } else {
        var noResult = document.createElement('div');
        noResult.style.padding = '0.8rem';
        noResult.style.color = '#ba2f2f';
        noResult.style.textAlign = 'center';
        noResult.style.fontSize = '0.95rem';
        noResult.textContent = 'No plants found';
        dropdown.appendChild(noResult);
      }
    }

    searchInput.addEventListener('input', function () {
      updateDropdown();

      // Original live nav list filtering logic
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

    clearBtn.addEventListener('click', function () {
      searchInput.value = '';
      updateDropdown();
      searchInput.focus();

      // Reset nav links filtering
      var listItems = sidebar.querySelectorAll('li');
      listItems.forEach(function (li) {
        li.style.display = '';
      });
    });

    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        window.location.href = '/shop?search=' + encodeURIComponent(searchInput.value.trim());
      }
    });
  }
});
