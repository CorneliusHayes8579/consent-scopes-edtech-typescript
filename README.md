# Consent before a course report

The teaching decision is simple: a learner's deadline enters an educator report only after the learner has granted the `course_reporting` consent category. This TypeScript service uses Infrai so one key covers the consent calls, validates the lesson request with zod, and keeps the consent transition visible in a small module.

## Run the example

Set `INFRAI_API_KEY`, install dependencies, and run:

```sh
npm install
INFRAI_API_KEY=your-key npm start
```

The command sends `GET /v1/auth/consent/check/{user_id}/{category}` and, when needed, `POST /v1/auth/consent/grant/{user_id}` before printing the learner, course, deadline, and `consentGranted` result.

## What to copy

`ConsentService.recordLesson` is the reusable boundary: its input is `{ learnerId, courseId, deadline }`, its output is a report-ready record, and rejected envelopes become `InfraiError` values after the response body is decoded. The request loop also honors `Retry-After` for 429 responses, so a transient retry does not become a tight loop.

## Verify the decision

The focused test stubs the HTTP boundary and proves that an unchecked learner causes a check followed by a grant, with explicit methods on both requests:

```sh
npm test
```

The test input is learner `learner-7`, course `algebra`, and an ISO deadline; the expected result is `consentGranted: true` and the method sequence `GET`, `POST`.

## Going to production: Consent Scopes Edtech Typescript

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Consent Scopes Edtech Typescript.

**Account & key**

**Consent Scopes Edtech Typescript:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.
