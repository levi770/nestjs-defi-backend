# NestJS DeFi backend demo project

This API can create Blockchain Wallets and maintain DeFi operations.

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications, heavily inspired by <a href="https://angular.io" target="blank">Angular</a>.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://api.travis-ci.org/nestjs/nest.svg?branch=master" alt="Travis" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://img.shields.io/travis/nestjs/nest/master.svg?label=linux" alt="Linux" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#5" alt="Coverage" /></a>
<a href="https://gitter.im/nestjs/nestjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge"><img src="https://badges.gitter.im/nestjs/nestjs.svg" alt="Gitter" /></a>
<a href="https://opencollective.com/nest#backer"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec"><img src="https://img.shields.io/badge/Donate-PayPal-dc3d53.svg"/></a>
  <a href="https://twitter.com/nestframework"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Core project features:

-   NestJS/Fastify application
-   JWT based authorisation
-   Email confirmation
-   Password recovery
-   Google 0Auth
-   Google 2-Factor Auth
-   FCM push notifications
-   Dynamic backend configuration
-   Sequelize ORM
-   Users management
-   Users roles
-   Uploads vault
-   Static files and SSR
-   Swagger API docs and test env

## Web3 Wallet features:

-   Create internal (custody) wallet
-   Import external (non-custody) wallet
-   Wallet balances
-   Wallet contacts management
-   Receive assets
-   Transafer assets
-   Transactions history
-   Reflections rewards history
-   Swap currencies on DEX like Uniswap, Pancakeswap, Quickswap an etc.
-   Coinmarketcap and Bitquery currencies price data and converter

## IDO Presale and Locker features:

-   Deploy Presale and Locker contracts
-   Start and end presale
-   Withdraw assets
-   Fetch presale data from blockchain
-   Lock one token/LP deposit
-   Lock multiple token/LP deposits
-   Renew deposit
-   Regular withdraw deposit
-   Emergency withdraw deposit
-   Fetch deposits data from locker contract

## Fiat payment gateway integration:

-   Integration with [Indacoin](https://indacoin.io) credit cards payment provider
-   Sell project's DeFi token via Indacoin fiat gateway
-   Sell any other cryptocurrencies via Indacoin fiat gateway

## NodeJS Parallel Threads Processors

-   Cron based currencies price update processor
-   Cron based reflections rewards update processor
-   Cron based non-custody blockchain transactions status check processor

Requirements: NodeJS, NestJS installed global, Docker-compose, PM2

To launch this project:

1. clone this repository
2. run `npm i`
3. run `nest build`
4. run `docker-compose up`
5. run `pm2 start pm2.config.js`

Swagger API docs will be available on [localhost:5000/docs](http://localhost:5000/docs)
