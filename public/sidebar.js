// Sidebar navigation script for The Botanical Bazaar
// Handles opening/closing of the sidebar on mobile, expanding nested groups
// and highlighting the active link based on the current page.

document.addEventListener("DOMContentLoaded", function () {
  var sidebar = document.getElementById("site-sidebar");
  var toggle = document.querySelector(".sidebar-toggle");
  // Toggle sidebar open/close on mobile
  if (toggle && sidebar) {
    toggle.addEventListener("click", function () {
      var isOpen = sidebar.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen);
      // When toggling the sidebar, also toggle a class on the body so content can slide over
      document.body.classList.toggle("sidebar-open", isOpen);
    });
  }
  // Toggle expandable groups
  var groupToggles = document.querySelectorAll(".group-toggle");
  groupToggles.forEach(function (btn) {
    var targetId = btn.getAttribute("aria-controls");
    var submenu = document.getElementById(targetId);
    if (!submenu) return;
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", (!expanded).toString());
      submenu.classList.toggle("open", !expanded);
    });
  });
  // Highlight active link
  var current = window.location.pathname.split("/").pop() || "index.html";
  // Remove query parameters if present
  current = current.split("?")[0];
  var links = document.querySelectorAll("#site-sidebar a");
  links.forEach(function (link) {
    if (link.getAttribute("href") === current) {
      link.classList.add("active");
      // If nested, ensure its parent submenu is open
      var parentSubmenu = link.closest(".submenu");
      if (parentSubmenu && !parentSubmenu.classList.contains("open")) {
        parentSubmenu.classList.add("open");
        // Find associated toggle and set aria-expanded
        var toggleId = parentSubmenu.getAttribute("id");
        var parentToggle = document.querySelector(
          '[aria-controls="' + toggleId + '"]',
        );
        if (parentToggle) {
          parentToggle.setAttribute("aria-expanded", "true");
        }
      }
    }
  });
  // Close sidebar when pressing Esc on mobile
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sidebar && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
      // Remove the slide class when closing via Escape key
      document.body.classList.remove("sidebar-open");
    }
  });

  // Ensure the collector's gallery appears in the navigation. Because
  // each page embeds the sidebar markup statically, we add the link
  // programmatically if it doesn't already exist. This reduces
  // duplication across pages and guarantees users can find the
  // gallery from anywhere on the site.
  try {
    // Sidebar insertion
    var sidebarList = document.querySelector("#site-sidebar ul");
    if (
      sidebarList &&
      !sidebarList.querySelector('a[href="orchids-gallery.html"]')
    ) {
      var li = document.createElement("li");
      var link = document.createElement("a");
      link.href = "orchids-gallery.html";
      link.textContent = "Gallery";
      li.appendChild(link);
      // Insert before the first .group if present so the gallery sits
      // above the expandable sections.
      var firstGroup = sidebarList.querySelector("li.group");
      if (firstGroup) {
        sidebarList.insertBefore(li, firstGroup);
      } else {
        sidebarList.appendChild(li);
      }
    }
    // Header nav insertion
    var headerNav = document.querySelector("header nav");
    if (
      headerNav &&
      !headerNav.querySelector('a[href="orchids-gallery.html"]')
    ) {
      var galleryLink = document.createElement("a");
      galleryLink.href = "orchids-gallery.html";
      galleryLink.textContent = "Gallery";
      // Insert before the contact link if it exists for consistent order
      var contactLink = headerNav.querySelector('a[href="contact.html"]');
      if (contactLink) {
        headerNav.insertBefore(galleryLink, contactLink);
      } else {
        headerNav.appendChild(galleryLink);
      }
    }
  } catch (err) {
    console.warn("Failed to insert gallery link into navigation:", err);
  }

  // Insert search input for live menu search with Lantern Submark link
  if (sidebar) {
    var searchContainer = document.createElement("div");
    searchContainer.className = "sidebar-search-container";

    var submarkLink = document.createElement("a");
    submarkLink.href = "/";
    submarkLink.className = "sidebar-search-submark-link";
    submarkLink.setAttribute("aria-label", "Home");

    var submarkImg = document.createElement("img");
    submarkImg.src = "/assets/lantern-submark.png";
    submarkImg.alt = "Lantern submark";
    submarkImg.className = "sidebar-search-submark";

    submarkLink.appendChild(submarkImg);
    searchContainer.appendChild(submarkLink);

    var searchInput = document.createElement("input");
    searchInput.id = "sidebar-search";
    searchInput.type = "text";
    // Use an ASCII ellipsis to avoid non-ASCII characters in the UI
    searchInput.placeholder = "Search our botanical goods...";
    searchInput.setAttribute("aria-label", "Search navigation and products");
    searchContainer.appendChild(searchInput);

    sidebar.insertBefore(searchContainer, sidebar.firstChild);

    // Create container for product matches in the sidebar
    var productResultsContainer = document.createElement("div");
    productResultsContainer.id = "sidebar-search-product-results";
    productResultsContainer.className = "sidebar-search-results-drawer";
    productResultsContainer.style.display = "none";
    sidebar.insertBefore(productResultsContainer, sidebar.children[1]);

    searchInput.addEventListener("input", function () {
      var query = searchInput.value.trim().toLowerCase();
      var navMenuUl = sidebar.querySelector("ul");

      if (query === "") {
        // Restore standard navigation links
        if (navMenuUl) navMenuUl.style.display = "block";
        productResultsContainer.style.display = "none";
        productResultsContainer.innerHTML = "";
      } else {
        // Hide standard navigation links to avoid crowding
        if (navMenuUl) navMenuUl.style.display = "none";
        productResultsContainer.style.display = "block";

        // Filter products loaded in window.PRODUCTS
        var allProds = window.PRODUCTS || [];
        var matchingProds = allProds
          .filter(function (p) {
            var haystack = [p.name, p.type, p.description]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            if (Array.isArray(p.categories))
              haystack += " " + p.categories.join(" ").toLowerCase();
            if (Array.isArray(p.tags))
              haystack += " " + p.tags.join(" ").toLowerCase();
            return haystack.indexOf(query) > -1;
          })
          .slice(0, 10);

        var html =
          '<div class="search-results-title">Product Matches (' +
          matchingProds.length +
          ")</div>";
        if (matchingProds.length === 0) {
          html +=
            '<p class="no-matches-text">No botanical goods match your search.</p>';
        } else {
          html += '<div class="search-results-list">';
          matchingProds.forEach(function (prod) {
            var isSold = !prod.quantity || prod.quantity < 3;
            var priceDisplay = isSold
              ? '<span class="result-sold-out">Sold Out</span>'
              : '<span class="result-price">$' +
                (prod.price ? prod.price.toFixed(2) : "0.00") +
                "</span>";
            if (!prod.price && !isSold)
              priceDisplay =
                '<span class="result-price">Price on Request</span>';

            html +=
              '<a href="/product/' +
              prod.slug +
              '" class="search-result-item-card">';
            html += '  <div class="result-img-wrapper">';
            html +=
              '    <img src="' +
              (prod.image || "/assets/placeholder.png") +
              '" alt="' +
              prod.name +
              '" class="result-img" />';
            html += "  </div>";
            html += '  <div class="result-info-wrapper">';
            html +=
              '    <strong class="result-name">' + prod.name + "</strong>";
            html += '    <span class="result-type">' + prod.type + "</span>";
            html +=
              '    <div class="result-price-row">' + priceDisplay + "</div>";
            html += "  </div>";
            html += "</a>";
          });
          html += "</div>";
        }
        productResultsContainer.innerHTML = html;
      }
    });
  }
});
