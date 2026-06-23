export const IssueTrackerSchema = JSON.stringify(
  {
    type: 'object',
    properties: {
      kind: {
        type: 'string',
        enum: ['task', 'story', 'defect'],
      },
      due_date: {
        type: 'string',
        format: 'date',
      },
      summary: {
        type: 'string',
        minLength: 5,
      },
    },
    renderer: {
      key: 'GridObject',
      columnAttributes: {
        kind: {
          span: '16',
        },
        due_date: {
          span: '16',
        },
        summary: {
          span: '16',
        },
      },
    },
    if: {
      properties: {
        kind: {
          type: 'string',
          const: 'task',
        },
      },
    },
    then: {
      $ref: '#/definitions/Task',
    },
    else: {
      if: {
        properties: {
          kind: {
            type: 'string',
            const: 'story',
          },
        },
      },
      then: {
        $ref: '#/definitions/Story',
      },
      else: {
        if: {
          properties: {
            kind: {
              type: 'string',
              const: 'defect',
            },
          },
        },
        then: {
          $ref: '#/definitions/Defect',
        },
      },
    },
    definitions: {
      Task: {
        properties: {
          done: {
            type: 'boolean',
          },
        },
      },
      Story: {
        properties: {
          status: {
            type: 'string',
            enum: ['new', 'reviewing', 'in-progress', 'done', 'rejected'],
          },
        },
      },
      Defect: {
        properties: {
          status: {
            type: 'string',
            enum: ['new', 'in-progress', 'done', 'canceled'],
          },
          severity: {
            type: 'string',
          },
        },
        required: ['status'],
      },
    },
  },
  null,
  '  ',
);

export const issueTrackerJson = JSON.stringify(
  {
    kind: 'task',
    summary: 'Implement a bug tracker on JSON schema',
  },
  null,
  '  ',
);
