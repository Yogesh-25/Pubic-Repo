let currentIndex = 0;
const usersPerPage = 1; // no of users to display per page
let users = [];
const token = "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";

// GitHub API endpoint
// to get GitHub users with public repositories
const usersApiUrl = "https://api.github.com/users?per_page=1000&type=public";
const userApiUrl = "https://api.github.com/users/";  //to get user details
const repoApiUrl = "https://api.github.com/users/{username}/repos?type=public";  //public repositories for a user

// Fetch and display user details and public repositories
async function fetchAndDisplay() {
    const user = users[currentIndex];

    // Add a check to ensure 'user' is defined before proceeding
    if (user) {
        await fetchUserDetails(user.login);
        await fetchPublicRepos(user.login);
    } else {
        console.error("User object is undefined at index:", currentIndex);
    }
}
// Fetch GitHub users and display
async function fetchUsers() {
    try {
        const response = await fetch(usersApiUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            console.error("GitHub API request failed:", response.status, response.statusText);
            return;
        }
        const data = await response.json();
        users = data;
        updatePageNumbers();
        fetchAndDisplay();
    } catch (error) {
        console.error("Error fetching GitHub users:", error);
    }
}


// Fetch user details using the GitHub API
async function fetchUserDetails(username) {
    try {
        const response = await fetch(`${userApiUrl}${username}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const user = await response.json();

        const userInfoContainer = document.getElementById("userInfo");
        const avatar = document.getElementById("avatar");
        const userInfoDetails = document.getElementById("userInfoDetails");
        const githubUrl = document.getElementById("githubUrl");

        // Set the avatar image source
        avatar.src = user.avatar_url;
        avatar.alt = `Avatar of ${user.login}`;

        // Set GitHub profile URL
        githubUrl.href = user.html_url;
        githubUrl.textContent = user.html_url;

        // Clear previous user details
        userInfoDetails.innerHTML = "";

        // Create and append user details to the DOM
        const nameElement = document.createElement("h1");
        nameElement.textContent = ` ${user.name || "N/A"}`;

        const locationElement = document.createElement("p");
        const locationIcon = document.createElement("i");
        locationIcon.className = "fas fa-map-marker-alt";
        locationElement.appendChild(locationIcon);

        // Check if the location is available
        if (user.location && user.location !== "N/A") {
            const locationLink = document.createElement("a");
            locationLink.href = `https://maps.google.com/?q=${encodeURIComponent(
                user.location
            )}`;
            locationLink.target = "_blank";
            locationLink.textContent = ` ${user.location}`;
            locationElement.appendChild(locationLink);

            //map icon clickable
            locationIcon.style.cursor = "pointer";
            locationIcon.addEventListener("click", () =>
                window.open(locationLink.href, "_blank")
            );
        } else {
            locationElement.innerHTML += " N/A";
        }

        // Create and append additional user details
        const twitterElement = document.createElement("p");
        twitterElement.innerHTML = `Twitter: ${user.twitter_username
            ? `<a href="https://twitter.com/${user.twitter_username}" target="_blank">https://twitter.com/${user.twitter_username}</a>`
            : "N/A"
            }`;

        const followersElement = document.createElement("p");
        followersElement.textContent = `Followers: ${user.followers || 0}`;

        const publicReposElement = document.createElement("p");
        publicReposElement.textContent = `Public Repositories: ${user.public_repos || 0
            }`;

        userInfoDetails.appendChild(nameElement);
        userInfoDetails.appendChild(locationElement);
        userInfoDetails.appendChild(followersElement);
        userInfoDetails.appendChild(publicReposElement);
        userInfoDetails.appendChild(twitterElement);

    } catch (error) {
        console.error("Error fetching user details:", error);
    }
}

// Fetch public repositories using the GitHub API
async function fetchPublicRepos(username) {
    try {
        const response = await fetch(repoApiUrl.replace("{username}", username), {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const repositories = await response.json();

        // Display public repositories in the DOM
        const repoList = document.getElementById("repoList");
        repoList.innerHTML = "";

        repositories.forEach((repo) => {
            const listItem = document.createElement("li");
            listItem.className = "repo-item";

            // Repository name as a clickable link
            const repoLink = document.createElement("a");
            repoLink.href = repo.html_url;
            repoLink.textContent = repo.name;
            repoLink.target = "_blank";

            // Repository description
            const repoDescription = document.createElement("p");
            repoDescription.textContent =
                repo.description || "No description available.";

            // Group repo name and button in a div
            const repoDetailsContainer = document.createElement("div");
            repoDetailsContainer.appendChild(repoLink);

            listItem.appendChild(repoDetailsContainer);
            listItem.appendChild(repoDescription);

            // Fetch and display the languages used in each repository
            fetchLanguages(repo, listItem);

            repoList.appendChild(listItem);
        });

    } catch (error) {
        console.error("Error fetching public repositories:", error);
    }
}

// Fetch and display the languages used in a repository
async function fetchLanguages(repo, listItem) {
    try {
        const languagesApiUrl = `https://api.github.com/repos/${repo.full_name}/languages`;
        const response = await fetch(languagesApiUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const languages = await response.json();

        // Display languages in the DOM
        const languagesList = document.createElement("div");
        languagesList.className = "languages-list";

        for (const language in languages) {
            const languageItem = document.createElement("span");
            languageItem.className = "language-item";
            languageItem.textContent = language;
            languagesList.appendChild(languageItem);
        }

        listItem.appendChild(languagesList);

    } catch (error) {
        console.error("Error fetching languages for the repository:", error);
    }
}

// Update page numbers with scrolling effect
function updatePageNumbers() {
    const pageNumbersContainer = document.getElementById("pageNumbers");
    pageNumbersContainer.innerHTML = "";

    const totalPages = Math.ceil(users.length / usersPerPage);
    const currentPage = Math.floor(currentIndex / usersPerPage) + 1;

    // Calculate the starting page to display
    const startPage = Math.max(currentPage - 9, 1);
    const endPage = Math.min(startPage + 9, totalPages);

    for (let i = startPage; i <= endPage; i++) {
        const pageNumberElement = document.createElement("span");
        pageNumberElement.className = "page-number";
        pageNumberElement.textContent = i;

        // Highlight the current page
        if (i === currentPage) {
            pageNumberElement.classList.add("current-page");
        }
        pageNumberElement.addEventListener("click", () => goToPage(i - 1));
        pageNumbersContainer.appendChild(pageNumberElement);
    }

    // Scroll the page numbers container to highlight the current page
    const scrollOffset = (currentPage - startPage) * 40;
    pageNumbersContainer.scrollLeft = scrollOffset;
}

// Navigate to a specific page
function goToPage(pageIndex) {
    currentIndex = pageIndex * usersPerPage;
    fetchAndDisplay();
    updatePageNumbers();
}

// Display details for the previous user
function prevUser() {
    if (currentIndex > 0) {
        currentIndex -= usersPerPage;
        fetchAndDisplay();
        updatePageNumbers();
    }
}

// Display details for the next user
function nextUser() {
    const totalPages = Math.ceil(users.length / usersPerPage);
    const lastPageIndex = totalPages - 1;

    if (currentIndex < lastPageIndex * usersPerPage) {
        currentIndex += usersPerPage;
    } else {
        currentIndex++;
    }
    fetchAndDisplay();
    updatePageNumbers();
}

// Initial fetch and display
fetchUsers();
