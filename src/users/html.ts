import type { UserType } from "./types";

const templateIDs = {
  userTableContainerID: "user-table-container",
  paginationContainerID: "pagination-container",
};

const html = {
  IDs: templateIDs,
  getContainerHTML: (searchQuery: string) => `<div class="user-container">
    <div class="user-header">
      <h1>User List</h1>
      <div class="search-container">
        <input type="text" id="search-input" placeholder="Search users..." value="${searchQuery}">
      </div>
      </div>
      <table class="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>actions</th>
          </tr>
        </thead>
        <tbody  id="${templateIDs.userTableContainerID}" class="loading">
        </tbody>
      </table>
      <div id="${templateIDs.paginationContainerID}" class="pagination">
      </div>
      <button id="reset">reset</button>
    </div>
  </div>`,
  getPaginationHTML: ({ page, total, limit }: { page: number; total: number; limit: number }) => {
    const delta = 2; // Number of pages to show around the current page
    const pages: (number | string)[] = [];

    for (let i = 1; i <= total; i++) {
      // Include first page, last page, and pages within the delta range of current page
      if (i === 1 || i === total || (i >= page - delta && i <= page + delta)) {
        const last = pages[pages.length - 1];

        if (typeof last === "number" && i - last > 1) {
          // If there's a gap of exactly 2, just show the missing number instead of "..."
          if (i - last === 2) {
            pages.push(i - 1);
          } else {
            pages.push("...");
          }
        }
        pages.push(i);
      }
    }

    return `<div class="pagination">
      <button class="pagination-start" id="start-page" ${page === 1 ? "disabled" : ""}>Start</button>
      <button class="pagination-button" id="prev-page" ${page === 1 ? "disabled" : ""}>Previous</button>

      ${pages
        .map((p) => {
          if (p === "...") {
            return `<span class="pagination-ellipsis">...</span>`;
          }
          return `<button class="pagination-page-button" data-page="${p}" id="page-${p}" ${
            p === page ? "disabled" : ""
          }>${p}</button>`;
        })
        .join("")}

      <span class="pagination-info">Page ${page} of ${total}</span>
      <button class="pagination-button" id="next-page" ${page === total ? "disabled" : ""}>Next</button>
      <button class="pagination-end" id="end-page" ${page === total ? "disabled" : ""}>End</button>
      
      <select id="select-page-count">
        <option value="10"  ${limit === 10 ? "selected" : ""}>10</option>
        <option value="20"  ${limit === 20 ? "selected" : ""}>20</option>
        <option value="50"  ${limit === 50 ? "selected" : ""}>50</option>
        <option value="100" ${limit === 100 ? "selected" : ""}>100</option>
        <option value="500" ${limit === 500 ? "selected" : ""}>500</option>
        <option value="1000" ${limit === 1000 ? "selected" : ""}>1000</option>
        <option value="5000" ${limit === 5000 ? "selected" : ""}>5000</option>
        <option value="10000" ${limit === 10000 ? "selected" : ""}>10000</option>
      </select>
    </div>`;
  },
  showSearchResultItem: (searchQuery: string, value: string) => {
    if (!searchQuery) {
      return value;
    }

    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return value.replace(regex, `<span class="search-result">$1</span>`);
  },
  getUserRowsHTML: (users: UserType[], searchQuery: string) =>
    users
      .map(
        (user) => `<tr>
          <td>${user.id}</td>
          <td>${html.showSearchResultItem(searchQuery, user.name)}</td>
          <td>${html.showSearchResultItem(searchQuery, user.email)}</td>
          <td>
            <button class="edit-button" data-id="${user.id}">Edit</button>
            <button class="delete-button" data-id="${user.id}">Delete</button>
          </td>
        </tr>`,
      )
      .join(""),
};

export default html;
