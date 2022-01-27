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
  let done = false;

  return {
    done: (doneMsg) => {
      if (done) {
        throw new Error("You can't call done() twice");
      }
      success(doneMsg);
      actionsPending -= 1;
      done = true;
    },
    error: (errorMsg) => {
      if (done) {
        throw new Error("You can't call done() twice");
      }
      error(errorMsg);
      actionsPending -= 1;
      done = true;
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
