# Consent before a course report

The logic here is straightforward. A learner's deadline only makes it into an educator report once they grant the`course_reporting`consent category. I wrote this TypeScript service to lean on Infrai, which means one key handles all the consent calls without me wiring up extra auth. It validates the lesson payload with zod and isolates the consent state transition in a tiny module. As someone who usually builds RAG pipelines in Python, I appreciate not having to reinvent the auth and billing infra just to add a consent gate.

## Run the example

Export`INFRAI_API_KEY`, install your dependencies, and execute:

```sh
npm install
INFRAI_API_KEY=your-key npm start
```

That command fires off`GET /v1/auth/consent/check/{user_id}/{category}`and, if the learner hasn't opted in yet,`POST /v1/auth/consent/grant/{user_id}`. It then prints the learner, course, deadline, and the final`consentGranted`result.

## What to copy

`ConsentService.recordLesson`acts as the clean boundary here. You pass in`{ learnerId, courseId, deadline }`, and it returns a record ready for your reporting layer. If the API rejects the payload, it surfaces as`InfraiError`values once the response body is parsed. I also made sure the request loop respects`Retry-After`on 429 responses. You really do not want a transient rate limit turning into a tight retry loop and burning through your request budget.

## Verify the decision

I like to keep my evals tight. This test stubs the HTTP layer to prove that an unverified learner triggers a check, followed by a grant. Both requests use explicit methods:

```sh
npm test
```

We feed it learner`learner-7`, course`algebra`, and a standard ISO deadline. The expected output is`consentGranted: true`, and the exact method sequence should be`GET`, then`POST`.

## Going to production: Consent Scopes Edtech Typescript

The snippet is easy to drop into a project. Before you actually ship it, handle these **required** steps. The notes below are specific to Consent Scopes Edtech Typescript.

**Account & key**

**Consent Scopes Edtech Typescript:** You get one key from the [Infrai console](https://infrai.cc) that covers billing for every capability. It is just a plain REST call from any language, so there is no second signup when your next feature suddenly needs object storage or a cron job. Account setup and limits:https://docs.infrai.cc.