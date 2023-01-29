# Fuzion Apps TypeScript SDK

The Fuzion Apps TypeScript SDK make it quick and easy to develop Fuzion APP that can be installed in the platform.
Fuzion is powerful PIM platform API Centric and event based.

Table of contents
=================

<!--ts-->
* [How it's work?](#how-its-work)
* [Triggers](#triggers)
* [State](#state)
<!--te-->


## How it's work

Any fuzion application is running using Serverless technology based on AWS Lambda.
The main purpose of an Apps is to react to event triggered by a functional change in the customer Space.

### Triggers

The application can be triggered in three different ways:
- By listening one of the many platform events (content.version.published, category.import, task.succeed...)
- On Scheduled time based on Cron expression
- Using RPC URL (secured with unique API-KEY)

### State

Fuzion APPs can be `installed` (more like activated) on a specific **Container**.
Each app will have a dedicated state per **Container**.

The state is useful to store metadata information related to the Application domain.
Everytime the application is executed, the state is given to the app and the app must return the next state.

> :warning: **the state is eventually consistent** 
> Due to the nature of the Asynchronous execution, multiple function can be executed at the same time and therefore have the same state.
> The latest execution will be the state memorize.
> If you need strong persistence, you should consider using specific database like DynamoDB or Firebase by injecting credentials in the application configuration.
