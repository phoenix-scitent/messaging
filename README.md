# messaging

> learner | learner - instructor | learner - learners

### data types

> state of data structure allows for polymorphic use, but all are 'response' (initial_question, question, answer)

```
response = {
  to: null | EmailString
  from: EmailString
  timestamp: DatetimeNumber
  body: BodyString
  responses: {} | { <pushkey>: response, <pushkey>: response, ... }
}

initial_question = response
```

#### flags and state

open | closed
unanswered | answered | response ('implicitly available via responses.length?')
permissions (learner | learner && instructor | all)
context (paths/URIs)

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