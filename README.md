# todo

```
2 paths seem useful to me
straight up location
course_slug/activity_slug/section_slug
and one that concats the user at the beginning
that way
the user query his own while going through the course
and later on, the admin side can aggregate the messages by course || activity || section
maybe the reverse would be better
course_slug/activity_slug/section_slug/userid
```

- add section info (and/or learner email) in instructor context?
- activity connected to share context (via window for simplicity?)
- pull out creating data structures and push/set and connections (export streamsa and functions)
- tracking and bookmarking in firebase with ETL bigquery
- authentication/authorization in firebase

# messaging

> learner | learner - instructor | learner - learners

### integration

- `dist/instructor.js` via netlify, embedded in WP
- `dist/learner.js` via netlify, embedded in WP
- `import { configureMessaging } from 'messaging';` via activity config

### build

- `npm run bundle:learner`
- `npm run bundle:instructor`
- `npm run start` (uses browsersync)
- `node examples/create.js` (create seed data)

### data types

> state of data structure allows for polymorphic use, but all are 'response' (initial_question, question, answer)

```
response = {
  from: EmailString
  timestamp: DatetimeNumber
  body: BodyString
  responses: {} | { <pushkey>: response, <pushkey>: response, ... },
  messageCreationPath: PathString (EmailString/LocationString)
}

initial_question = response
```

#### flags and state

- open | closed
- unanswered | answered | response ('implicitly available via responses.length?')
- permissions (learner | learner && instructor | all)
- context (paths/URIs)

#### retreval

##### learner (in activity)

```javascript
ref.orderByChild('context').equalTo(LearnerActivitySectionPathUri)
```

##### learner (activity)

```javascript
ref.orderByChild('from').equalTo(EmailString)
```

##### instructor

```javascript
ref.orderByChild('responses').startAt("")
ref.orderByChild('responses').endAt(null)
```