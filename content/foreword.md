# Functional Programming in Typescript

This book is a reference and a training material for using Typescript in a functional programming style. It mainly uses [fp-ts](https://github.com/gcanti/fp-ts "fp-ts") library as it's the most mature typescript library for typed functional programming at the time of writing.

## Setup

You can read this book [here](https://alenkis.github.io/functional-programming-typescript-book), but if you also choose to solve exercises, it will be convenient to clone the repo:

```sh
git clone git@github.com:alenkis/functional-programming-typescript-book.git --branch no-solutions && cd functional-programming-typescript-book
```

All the code is located in `/exercises` folder

```sh
cd /exercises
```

Install dependencies with:

```sh
yarn

# or with npm
npm install
```

For each chapter that contains exercises, you can solve them in TDD style by running tests with `yarn test:{chapterNumber}` and implementing the functions one by one.

```sh
yarn test:chapter3

# or
npm run test:chapter3
```

## Status

This book is being continuously written, so feel free to report any [issues or suggestions](https://github.com/alenkis/functional-programming-typescript-book/issues)
