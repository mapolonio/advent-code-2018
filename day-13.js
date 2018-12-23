import Promise from 'bluebird';
import fs from 'fs';

const turnsDict = {
  '>': {
    left: '^',
    straight: '>',
    right: 'v',
  },
  '<': {
    left: 'v',
    straight: '<',
    right: '^',
  },
  v: {
    left: '>',
    straight: 'v',
    right: '<',
  },
  '^': {
    left: '<',
    straight: '^',
    right: '>',
  },
};

const tickDict = {
  '>': {
    '-': {
      xDelta: 1,
      yDelta: 0,
      nextOrientation: '>',
    },
    '\\': {
      xDelta: 1,
      yDelta: 0,
      nextOrientation: 'v',
    },
    '/': {
      xDelta: 1,
      yDelta: 0,
      nextOrientation: '^',
    },
    '+': {
      xDelta: 1,
      yDelta: 0,
      nextOrientation: 'calculate',
    },
  },
  '<': {
    '-': {
      xDelta: -1,
      yDelta: 0,
      nextOrientation: '<',
    },
    '\\': {
      xDelta: -1,
      yDelta: 0,
      nextOrientation: '^',
    },
    '/': {
      xDelta: -1,
      yDelta: 0,
      nextOrientation: 'v',
    },
    '+': {
      xDelta: -1,
      yDelta: 0,
      nextOrientation: 'calculate',
    },
  },
  '^': {
    '|': {
      xDelta: 0,
      yDelta: -1,
      nextOrientation: '^',
    },
    '\\': {
      xDelta: 0,
      yDelta: -1,
      nextOrientation: '<',
    },
    '/': {
      xDelta: 0,
      yDelta: -1,
      nextOrientation: '>',
    },
    '+': {
      xDelta: 0,
      yDelta: -1,
      nextOrientation: 'calculate',
    },
  },
  v: {
    '|': {
      xDelta: 0,
      yDelta: 1,
      nextOrientation: 'v',
    },
    '\\': {
      xDelta: 0,
      yDelta: 1,
      nextOrientation: '>',
    },
    '/': {
      xDelta: 0,
      yDelta: 1,
      nextOrientation: '<',
    },
    '+': {
      xDelta: 0,
      yDelta: 1,
      nextOrientation: 'calculate',
    },
  },
};

function parseMap(input) {
  const tracks = [];
  const carts = [];

  const lines = input.split('\n');

  lines.forEach((line, y) => {
    if (line.length === 0) return;

    const cols = [];

    line.split('').forEach((col, x) => {
      if (col === '<' || col === '>') {
        carts.push({ x, y, direction: col, nextTurn: 'left' });

        cols.push('-');

        return;
      }

      if (col === '^' || col === 'v') {
        carts.push({ x, y, direction: col, nextTurn: 'left' });

        cols.push('|');

        return;
      }

      cols.push(col);
    });

    tracks.push(cols);
  });

  return {
    tracks,
    carts,
  };
}

function tick(tracks, carts) {
  let oldCarts = carts.map((c) => ({ ...c }));
  let newCarts = [];

  while (oldCarts.length) {
    oldCarts = sortCarts(oldCarts);
    const cart = oldCarts.shift();

    const { x, y } = getNextPosition(cart, tracks);

    const newCart = {
      ...cart,
      x,
      y,
    };

    const { direction, nextTurn } = getNextPosition(newCart, tracks);

    newCart.direction = direction;
    newCart.nextTurn = nextTurn;

    newCarts.push(newCart);

    const colitions = checkColitions(oldCarts, newCarts);

    if (colitions.length > 0) {
      oldCarts = removeCollided(oldCarts, colitions);
      newCarts = removeCollided(newCarts, colitions);
    }

    newCarts = removeCollided(newCarts, checkColition(newCarts));
  }

  return newCarts;

  // const result = sortCarts(carts).reduce((acc, cart) => {
  //   const { x, y } = getNextPosition(cart, tracks);

  //   const newCart = {
  //     ...cart,
  //     x,
  //     y,
  //   };

  //   const { direction, nextTurn } = getNextPosition(newCart, tracks);

  //   newCart.direction = direction;
  //   newCart.nextTurn = nextTurn;

  //   acc.push(newCart);

  //   return acc;
  // });

  // const colitions = checkColition(result);

  // return result.filter(
  //   (cart) =>
  //     !colitions.find(
  //       (colition) => colition.x === cart.x && colition.y === cart.y
  //     )
  // );
}

function removeCollided(carts, colitions) {
  return carts.filter(
    (cart) =>
      !colitions.find(
        (colition) => colition.x === cart.x && colition.y === cart.y
      )
  );
}

function checkColitions(oldCarts, newCarts) {
  const colitions = [];

  oldCarts.forEach((oldCart) => {
    newCarts.forEach((newCart) => {
      if (oldCart.x === newCart.x && oldCart.y === newCart.y) {
        colitions.push({ x: oldCart.x, y: oldCart.y });
      }
    });
  });

  return colitions;
}

function getNextPosition(cart, tracks) {
  const { x, y, direction } = cart;
  const result = { ...cart };

  const currentTrack = tracks[y][x];

  const { xDelta, yDelta, nextOrientation } = tickDict[direction][currentTrack];

  result.x += xDelta;
  result.y += yDelta;

  if (nextOrientation === 'calculate') {
    const { nextDirection, nextTurn } = getNextDirection(result);

    result.direction = nextDirection;
    result.nextTurn = nextTurn;

    return result;
  }

  result.direction = nextOrientation;

  return result;
}

function getNextDirection(cart) {
  const turns = ['left', 'straight', 'right'];

  let nextTurnIndex = turns.indexOf(cart.nextTurn);

  const nextDirection = turnsDict[cart.direction][cart.nextTurn];

  nextTurnIndex += 1;

  if (nextTurnIndex >= turns.length) {
    nextTurnIndex = 0;
  }

  const nextTurn = turns[nextTurnIndex];

  return {
    nextDirection,
    nextTurn,
  };
}

function checkColition(carts) {
  const colitions = [];

  carts.forEach((cartA, i) => {
    carts.forEach((cartB, j) => {
      if (i !== j && cartA.x === cartB.x && cartA.y === cartB.y) {
        colitions.push({ x: cartA.x, y: cartA.y });
        // throw new Error(`(${cartA.x}, ${cartA.y})`);
      }
    });
  });

  return colitions;
}

function sortCarts(carts) {
  return carts.sort((a, b) => a.x - b.x).sort((a, b) => a.y - b.y);
}

function render(tracks, carts) {
  const result = tracks.map((row) => [...row]);
  let stringResult = '';

  carts.forEach((cart) => {
    result[cart.y][cart.x] = cart.direction;
  });

  result.forEach((row) => {
    stringResult += `${row.join('')}\n`;
  });

  return stringResult;
}

async function run(inputPath) {
  const map = await new Promise((resolve, reject) =>
    fs.readFile(inputPath, 'utf8', (err, contents) => {
      if (err) return reject(err);

      return resolve(contents);
    })
  );

  let { tracks, carts } = parseMap(map);
  console.log('carts', carts.length);

  console.log(render(tracks, carts));
  for (let i = 0; i < 100000; i += 1) {
    console.log(i);

    carts = tick(tracks, carts);

    if (carts.length === 1) {
      throw new Error(
        `Last cart at (${carts[0].x}, ${carts[0].y}) ${JSON.stringify(
          carts[0]
        )}`
      );
    }

    // console.log(render(tracks, carts));
  }
}

// run('day13-inputs/test.txt');
run('day13-inputs/input.txt');
// run('day13-inputs/part2-test.txt');
// run('day13-inputs/part2-test2.txt');
