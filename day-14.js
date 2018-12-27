const startingRecipes = [3, 7];
const elves = 2;

function generateRecipes(currentRecipes, recipes) {
  const selectedRecipes = currentRecipes.map((c) => recipes[c]);

  const sum = selectedRecipes.reduce((acc, r) => acc + r, 0);

  const nextRecipes = `${sum}`.split('').map((r) => parseInt(r, 10));

  return [...recipes, ...nextRecipes];
}

function selectNextRecipes(currentRecipes, recipes) {
  return currentRecipes.map((r) => {
    console.log({
      r,
      'recipes[r] + 1': recipes[r] + 1,
      result: (recipes[r] + 1) % recipes.length,
    });
    return (recipes[r] + 1) % recipes.length;
  });
}

function render(currentRecipes, recipes) {
  return recipes.map((r, i) => {
    if (currentRecipes.includes(i)) {
      return `(${r})`;
    }

    return r;
  });
}

function run(pendingRecipes, numberOfElves) {
  let recipes = pendingRecipes;
  let currentRecipes = Array.from(new Array(numberOfElves)).map((e, i) => i);
  console.log({ currentRecipes });

  console.log(render(currentRecipes, recipes));

  for (let i = 0; i < 2; i += 1) {
    recipes = generateRecipes(currentRecipes, recipes);
    currentRecipes = selectNextRecipes(currentRecipes, recipes);

    console.log({ currentRecipes });
    console.log(render(currentRecipes, recipes));
  }
}

run(startingRecipes, elves);
