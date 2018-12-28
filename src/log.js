const chalk = require('chalk');

const makeProgress = (title) => {
  console.log(chalk`{dim ${title}}...`);

  return {
    done: () => {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      console.log(chalk`{dim ${title}}... {bgGreen.black Done!}`);
    },
  };
};

module.exports = {
  makeProgress,
};
