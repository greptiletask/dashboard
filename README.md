# Next.js App with Clerk

This repository contains a Next.js application configured with [Clerk](https://clerk.dev). Below, you will find instructions to set up the environment variables, install dependencies, and run/build the application.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Building the Application](#building-the-application)
- [Additional Information](#additional-information)

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or above recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

---

## Environment Variables

The following environment variables are required:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bWFueS1sb3VzZS01OC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_VDtYDmJFDEZoHCnxzdQCAW482yiCIEzXrkZkA80nS8
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_API_URL=http://localhost:8001
```
(The keys here are inserted for example, and they have been rotated for no malicious use)
## Installation 

`npm run install`

## Running the application

`npm run dev`

## Building the application

`npm run build`

Additional Information

 - Next.js Documentation: Official Next.js docs
 - Clerk Documentation: Official Clerk docs
 - Environment Variables: Next.js Environment Variables docs


