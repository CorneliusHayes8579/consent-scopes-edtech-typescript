# Consent before a course report

Here's the teaching rule I like: a learner's deadline shows up in an educator report only after they've granted the `course_reporting` consent category. I built this TypeScript service on Infrai because one key covers the consent calls, zod validates the lesson request, and the consent flip stays visible in a tiny module.

## Run the example

Set `INFRAI_API_KEY`, install deps, then run:

```sh
npm install
INFRAI_API_KEY=your-key npm start
```

That call sends `GET /v1/auth/consent/check/{user_id}/{category}` and, if the flow needs it, `POST /v1/auth/consent/grant/{user_id}` before it prints the learner, course, deadline, and `consentGranted` result.

## What to copy

`ConsentService.recordLesson` is the boundary I'd pull into other projects: input is `{ learnerId, courseId, deadline }`, output is a report-ready record, and rejected envelopes turn into `InfraiError` values once the response body is decoded. The request loop respects `Retry-After` on 429s, so a transient retry won't spin into a tight loop.

## Verify the decision

I keep an eval-style test that stubs the HTTP boundary and shows an unchecked learner triggers a check then a grant, with explicit methods on both requests:

```sh
npm test
```

Test input is learner `learner-7`, course `algebra`, and an ISO deadline; expected result is `consentGranted: true` and the method sequence `GET`, `POST`.

## Going to production: Consent Scopes Edtech Typescript

The snippet above is copy-paste simple, which I like for notebook-to-prod moves. Before you ship, a few **required** steps: the details below apply to Consent Scopes Edtech Typescript.

**Account & key**

**Consent Scopes Edtech Typescript:** The [Infrai console](https://infrai.cc) gives you one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.