const chalk = require('chalk');

let actionsPending = 0;

const log = (msg = '') => {
  if (actionsPending) {
    process.stdout.write(`${' '.repeat(actionsPending * 4)}`);
  }
  process.stdout.write(chalk`${msg}\n`);
};

const info = (msg = '') => {
  if (actionsPending) {
    process.stdout.write(`${' '.repeat(actionsPending * 4)}`);
  }
  process.stdout.write(chalk`{bgBlue.white Info} ${msg}\n`);
};

const warning = (msg = '') => {
  if (actionsPending) {
    process.stdout.write(`${' '.repeat(actionsPending * 4)}`);
  }
  process.stdout.write(chalk`{bgYellow.black Warning} ${msg}\n`);
};

const error = (msg = '') => {
  if (actionsPending) {
    process.stdout.write(`${' '.repeat(actionsPending * 4)}`);
  }
  process.stdout.write(chalk`{bgRed.black Error} ${msg}\n`);
};

const success = (msg = '') => {
  if (actionsPending) {
    process.stdout.write(`${' '.repeat(actionsPending * 4)}`);
  }
  process.stdout.write(chalk`{green Success} {dim ${msg}}\n`);
};

const makeProgress = (title) => {
  log(`${title}…`);
  actionsPending += 1;

  return {
    done: (doneMsg) => {
      success(doneMsg);
      actionsPending -= 1;
    },
    error: (errorMsg) => {
      error(errorMsg);
      actionsPending -= 1;
    },
  };
};

module.exports = {
  log,
  info,
  warning,
  error,
  success,
  makeProgress,
};
