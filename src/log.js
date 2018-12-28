const chalk = require('chalk');

let actionsPending = 0;

const log = (msg = '') => {
  process.stdout.write(chalk`${msg}\n`);
};

const info = (msg = '') => {
  if (actionsPending) {
    process.stdout.write('\n    ');
  }
  process.stdout.write(chalk`{bgBlue.white Info} ${msg}`);
  if (!actionsPending) {
    process.stdout.write('\n');
  }
};

const warning = (msg = '') => {
  if (actionsPending) {
    process.stdout.write('\n    ');
  }
  process.stdout.write(chalk`{bgYellow.black Warning} ${msg}`);
  if (!actionsPending) {
    process.stdout.write('\n');
  }
};

const error = (msg = '') => {
  if (actionsPending) {
    process.stdout.write('\n    ');
  }
  process.stdout.write(chalk`{bgRed.black Error} ${msg}\n`);
  if (!actionsPending) {
    process.stdout.write('\n');
  }
};

const success = (msg = '') => {
  if (actionsPending) {
    process.stdout.write('\n    ');
  }
  process.stdout.write(chalk`{green Success} {dim ${msg}}\n`);
  if (!actionsPending) {
    process.stdout.write('\n');
  }
};

const makeProgress = (title) => {
  actionsPending += 1;
  process.stdout.write(chalk`${title}… `);

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
