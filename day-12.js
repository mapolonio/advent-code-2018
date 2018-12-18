import { Exception } from 'handlebars';

const test = '#..#.#..##......###...###';
const real =
  '#.......##.###.#.#..##..##..#.#.###..###..##.#.#..##....#####..##.#.....########....#....##.#..##...';

const rules = [
  '..... => .',
  '#.... => .',
  '..### => .',
  '##..# => #',
  '.###. => #',
  '...## => .',
  '#.#.. => .',
  '..##. => .',
  '##.#. => #',
  '..#.. => .',
  '.#... => #',
  '##.## => .',
  '....# => .',
  '.#.#. => .',
  '#..#. => #',
  '#.### => .',
  '.##.# => #',
  '.#### => .',
  '.#..# => .',
  '####. => #',
  '#...# => #',
  '.#.## => #',
  '#..## => .',
  '..#.# => #',
  '#.##. => .',
  '###.. => .',
  '##### => #',
  '###.# => #',
  '...#. => #',
  '#.#.# => #',
  '.##.. => .',
  '##... => #',
];

const testRules = [
  '...## => #',
  '..#.. => #',
  '.#... => #',
  '.#.#. => #',
  '.#.## => #',
  '.##.. => #',
  '.#### => #',
  '#.#.# => #',
  '#.### => #',
  '##.#. => #',
  '##.## => #',
  '###.. => #',
  '###.# => #',
  '####. => #',
];

class Pots {
  constructor(generation, currentRules) {
    this.plants = [];
    this.firstPlant = null;
    this.lastPlant = null;
    this.rules = parseRules(currentRules);
    this.parseGeneration(generation);
    this.generationMap = {};
    this.plantString = this.render();
  }

  parseGeneration(generation) {
    generation.split('').forEach((p, i) => {
      if (p === '#') {
        this.plants.push(i);

        if (this.firstPlant === null) {
          this.firstPlant = i;
        }

        if (this.lastPlant === null || this.lastPlant < i) {
          this.lastPlant = i;
        }
      }
    });
  }

  growNextGeneration() {
    if (this.generationMap[this.plantString]) {
      return this.loadGeneration();
    }

    const nextGen = [];

    for (let i = this.firstPlant - 4; i <= this.lastPlant + 4; i += 1) {
      const window = this.buildWindowFrom(i);
      const nextState = this.rules[window];
      const current = i + 2;

      if (nextState) {
        nextGen.push(current);
      }
    }

    this.generationMap[this.plantString] = {
      delta: nextGen[0] - this.firstPlant,
      firstPlant: nextGen[0],
      result: nextGen,
    };

    this.plants = nextGen;
    this.firstPlant = this.plants[0];
    this.lastPlant = this.plants[this.plants.length - 1];
    this.plantString = this.render();
  }

  loadGeneration() {
    const { delta, firstPlant, result } = this.generationMap[this.plantString];
    const transformer = this.firstPlant + delta - firstPlant;

    this.firstPlant = result[0] + transformer;
    this.lastPlant = result[result.length - 1] + transformer;
  }

  fixGeneration() {
    const { firstPlant, result } = this.generationMap[this.render()];
    const transformer = this.firstPlant - firstPlant;

    this.plants = result.map((index) => index + transformer);
  }

  getScore() {
    this.fixGeneration();
    return this.plants.reduce((acc, plant) => acc + plant, 0);
  }

  buildWindowFrom(index, size = 5) {
    let window = '';

    for (let i = index; i < index + size; i += 1) {
      window += this.plants.includes(i) ? '#' : '.';
    }

    return window;
  }

  render() {
    const result = Array(
      this.plants[this.plants.length - 1] - this.plants[0]
    ).fill('.');

    this.plants.forEach((pot) => {
      result[pot - this.plants[0]] = '#';
    });

    return result.join('');
  }
}

function parseRules(input) {
  const ruleRegexp = /([\.#]{5}) => ([\.#])/;

  return input.reduce((acc, rule) => {
    const [, state, result] = rule.match(ruleRegexp);

    acc[state] = result === '#';

    return acc;
  }, {});
}

function run2(firstGeneration, currentRules, generations) {
  const pots = new Pots(firstGeneration, currentRules);

  console.time('1 millon');

  for (let i = 1; i < generations + 1; i += 1) {
    pots.growNextGeneration();

    if (i === 1000000) {
      console.timeEnd('1 millon');
    }

    if (i % 100000 === 0) {
      console.log(i);
    }
  }

  console.log('final', /* pots.plants,  */ pots.getScore());
}

// console.log(run(real, rules));
// console.log(run(test, testRules));
// console.log(run2(real, rules, 20));
// console.log(run2(test, testRules, 10000));
console.log(run2(real, rules, 50000000000));
