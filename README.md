# todo

```
8]
2 paths seem useful to me

[10:08]
straight up location

[10:09]
course_slug/activity_slug/section_slug

[10:09]
and one that concats the user at the beginning

[10:09]
that way

[10:09]
the user query his own while going through the ocurse

[10:09]
course

[10:10]
and later on, the admin side can aggregate the messages by course || activity || section

[10:10]
maybe the reverse would be better

[10:10]
course_slug/activity_slug/section_slug/userid
```

- activity connected to share context
- pull out creating data structures and push/set and connections (export streamsa and functions)
- tracking and bookmarking in firebase with ETL bigquery
- authentication/authorization in firebase

# messaging

> learner | learner - instructor | learner - learners

### integration

- `dist/instructor.js` via netlify
- `dist/learner.js` via netlify

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