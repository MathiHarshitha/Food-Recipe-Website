const searchBtn = document.getElementById('search-btn');
const mealList = document.getElementById('meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipe-close-btn');

// Event listeners
searchBtn.addEventListener('click', getMealList);
mealList.addEventListener('click', getMealRecipe);
recipeCloseBtn.addEventListener('click', () => {
    mealDetailsContent.parentElement.classList.remove('showRecipe');
});

// Get meal list that matches with the ingredients
function getMealList() {
    let searchInputTxt = document.getElementById('search-input').value.trim();
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchInputTxt}`)
        .then(response => response.json())
        .then(data => {
            let html = "";
            if (data.meals) {
                data.meals.forEach(meal => {
                    html += `
                    <div class="meal-item" data-id="${meal.idMeal}">
                        <div class="meal-img">
                            <img src="${meal.strMealThumb}" alt="food">
                        </div>
                        <div class="meal-name">
                            <h3>${meal.strMeal}</h3>
                            <a href="#" class="recipe-btn">Read Recipe</a>
                        </div>
                    </div>
                `;
                });
                mealList.classList.remove('notFound');
            } else {
                html = "Sorry, we didn't find any meal!";
                mealList.classList.add('notFound');
            }

            mealList.innerHTML = html;
        });
}

// Get recipe of the meal
function getMealRecipe(e) {
    e.preventDefault();
    if (e.target.classList.contains('recipe-btn')) {
        let mealItem = e.target.parentElement.parentElement;
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`)
            .then(response => response.json())
            .then(data => mealRecipeModal(data.meals));
    }
}

// Create a modal with Save Recipe button
function mealRecipeModal(meal) {
    meal = meal[0];
    let html = `
        <h2 class="recipe-title">${meal.strMeal}</h2>
        <p class="recipe-category">${meal.strCategory}</p>
        <div class="recipe-instruct">
            <h3>Instructions:</h3>
            <p>${meal.strInstructions}</p>
        </div>
        <div class="recipe-meal-img">
            <img src="${meal.strMealThumb}" alt="">
        </div>
        <div class="recipe-link">
            <a href="${meal.strYoutube}" target="_blank">Watch Video</a>
        </div>
        <button class="save-recipe-btn btn">Save Recipe</button>
    `;
    mealDetailsContent.innerHTML = html;
    mealDetailsContent.parentElement.classList.add('showRecipe');

    // Save recipe to localStorage when the Save button is clicked
    document.querySelector('.save-recipe-btn').addEventListener('click', () => saveRecipe(meal));
}

// Save recipe to localStorage
function saveRecipe(meal) {
    let savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];

    // Check if recipe is already saved
    if (!savedRecipes.some(recipe => recipe.idMeal === meal.idMeal)) {
        savedRecipes.push(meal);
        localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
        alert('Recipe saved successfully!');
        displaySavedRecipes(); // Refresh the saved recipes display
    } else {
        alert('This recipe is already saved.');
    }
}

// Function to display saved recipes
function displaySavedRecipes() {
    let savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];
    let html = "";

    savedRecipes.forEach(meal => {
        html += `
        <div class="meal-item" data-id="${meal.idMeal}">
            <div class="meal-img">
                <img src="${meal.strMealThumb}" alt="food">
            </div>
            <div class="meal-name">
                <h3>${meal.strMeal}</h3>
                <a href="#" class="recipe-btn">Read Recipe</a>
                <cite>~Saved By You😍<cite>
            </div>
        </div>
        `;
    });

    // Display the saved recipes in the designated section
    document.getElementById('saved-meals').innerHTML = html;

    // Add event listener to the newly added "Read Recipe" buttons
    document.querySelectorAll('#saved-meals .recipe-btn').forEach(button => {
        button.addEventListener('click', getSavedMealRecipe);
    });
}

// Show saved meal recipe in modal
function getSavedMealRecipe(e) {
    e.preventDefault();
    let mealItem = e.target.parentElement.parentElement;
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`)
        .then(response => response.json())
        .then(data => mealRecipeModal(data.meals));
}

// Call displaySavedRecipes when the page loads
window.addEventListener('load', displaySavedRecipes);