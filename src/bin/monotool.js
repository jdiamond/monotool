#!/usr/bin/env node

// @flow

import getopts from 'getopts';
import main from '../lib/monotool';

main(getopts(process.argv.slice(2)))
  .then(result => {
    if (result.ok) {
      console.log('done');
    } else {
      console.error(result.msg);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
