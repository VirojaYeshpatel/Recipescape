const apiUrl = "http://localhost:4000/api/recipes"; // backend API
const searchUrl = "http://localhost:4000/api/recipes/search"; // search endpoint

// DOM elements
const tableBody = document.getElementById("table_body");
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("searchBtn");
const drawer = document.getElementById("recipe_drawer");
const drawerTitle = document.getElementById("drawer_title");
const drawerCuisine = document.getElementById("drawer_cuisine");
const drawerTotalTime = document.getElementById("drawer_total_time");
const drawerDescription = document.getElementById("drawer_description");
const drawerNutrients = document.getElementById("drawer_nutrients");
const closeDrawerBtn = document.getElementById("close_drawer");

let currentPage = 1;
const limit = 10;
let totalRecipes = 0;

// display recipes
function displayRecipes(recipes) {
    tableBody.innerHTML = ""; // clear previous

    if (!recipes.length) {
        tableBody.innerHTML = `<tr><td colspan="5">No recipes found.</td></tr>`;
        return;
    }

    recipes.forEach(recipe => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${recipe.title}</td>
            <td>${recipe.cuisine}</td>
            <td>${recipe.rating || 'N/A'}</td>
            <td>${recipe.total_time || 'N/A'}</td>
            <td>${recipe.serves || 'N/A'}</td>
        `;
        
        // Add click event listener to open drawer
        row.addEventListener('click', () => {
            console.log("Row clicked:", recipe.title);
            openDrawer(recipe);
        });
        
        tableBody.appendChild(row);
    });
}

// fetch recipes
function fetchRecipes(page = 1) {
    fetch(`${apiUrl}?page=${page}&limit=${limit}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            totalRecipes = data.total;
            displayRecipes(data.data);
            document.getElementById('pageInfo').textContent = `Page ${data.page}`;

            document.getElementById('prevBtn').disabled = (data.page === 1);
            document.getElementById('nextBtn').disabled = (data.page * data.limit >= data.total);
        })
        .catch(err => {
            console.error('Error fetching recipes:', err);
        });
}

// open drawer
function openDrawer(recipe) {
    console.log("Opening drawer for:", recipe.title);
    
    drawerTitle.textContent = recipe.title || 'Unknown Recipe';
    drawerCuisine.textContent = recipe.cuisine || 'Unknown';
    drawerTotalTime.textContent = recipe.total_time || 'N/A';
    drawerDescription.textContent = recipe.description || 'No description available';

    // Clear and populate nutrients
    drawerNutrients.innerHTML = '';
    if (recipe.nutrients && typeof recipe.nutrients === 'object') {
        Object.entries(recipe.nutrients).forEach(([key, value]) => {
            const li = document.createElement('li');
            li.textContent = `${key}: ${value}`;
            drawerNutrients.appendChild(li);
        });
    } else {
        drawerNutrients.innerHTML = '<li>No nutritional information available</li>';
    }

    // Show drawer
    drawer.classList.add('drawer_visible');
}

// close drawer
closeDrawerBtn.addEventListener('click', () => {
    console.log("Closing drawer");
    drawer.classList.remove('drawer_visible');
});

// pagination
document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchRecipes(currentPage);
    }
});

document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentPage * limit < totalRecipes) {
        currentPage++;
        fetchRecipes(currentPage);
    }
});

// search
searchBtn.addEventListener("click", () => {
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
        currentPage = 1;
        fetchRecipes(currentPage);
        return;
    }

    fetch(`${searchUrl}?title=${encodeURIComponent(query)}&cuisine=${encodeURIComponent(query)}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            displayRecipes(data.data);
            document.getElementById('pageInfo').textContent = `Search Results`;

            document.getElementById('prevBtn').disabled = true;
            document.getElementById('nextBtn').disabled = true;
        })
        .catch(err => {
            console.error('Search error:', err);
        });
});

// allow search on Enter key
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// initial fetch
fetchRecipes(currentPage);