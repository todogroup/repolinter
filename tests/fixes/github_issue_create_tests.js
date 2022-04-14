const { expect } = require('chai')
const nock = require('nock')
const { Octokit } = require('@octokit/rest')

function mockStandardGithubApiCalls(repoIssues, githubIssueTemplate) {
  nock('https://api.github.com')
    .get(
      `/repos/test/tester-repo/issues?labels=continuous-compliance%2Cautomated&state=all&sort=created&direction=desc`
    )
    .reply(200, repoIssues)

  nock('https://api.github.com')
    .get(`/repos/test/tester-repo/labels/continuous-compliance`)
    .reply(200)
  nock('https://api.github.com')
    .get(`/repos/test/tester-repo/labels/automated`)
    .reply(200)
  nock('https://api.github.com')
    .get(`/repos/test/tester-repo/labels/CC%3A%20Bypass`)
    .reply(200)
  nock('https://api.github.com')
    .get(`/repos/test/tester-repo/contributors`)
    .reply(200)
  nock('https://api.github.com')
    .post(`/repos/test/tester-repo/issues`)
    .reply(200, githubIssueTemplate)
}

describe('fixes', () => {
  describe('github-issue-create', () => {
    const InternalHelpers = require('../../fixes/helpers/github-issue-create-helpers')
    const GithubIssueCreate = require('../../fixes/github-issue-create')

    const validOptions = {
      issueCreator: 'Philips - Continuous Compliance',
      issueLabels: ['continuous-compliance', 'automated'],
      bypassLabel: 'CC: Bypass',
      issueTitle: 'Continuous Compliance - Valid test 👍',
      issueBody:
        'Hi there 👋, \n' +
        ' Philips tries to make sure that repositories in this organization follow a certain standardization. While reviewing your repository, we could not stop ourselves to further improve this repository! \n' +
        ' We are happy to help you set up a nice Read me, please head over to Slack and we will get you set up. \n' +
        ' Auto-generated issue by Continuous Compliance',
      commentBody:
        "Hey, it's me, I am back😎. \n" +
        ' We noticed regression on this issue, so we opened and updated it. \n' +
        " If you want to bypass the check for this rule, attach the 'CC: Bypass' label. \n" +
        ' Thanks!',
      uniqueRuleId: '89b2a899-0fab-423c-99b9-ed88d958f19d'
    }

    const githubIssue = {
      url:
        'https://api.github.com/repos/Brend-Smits/octokit-test-repo/issues/17',
      repository_url:
        'https://api.github.com/repos/Brend-Smits/octokit-test-repo',
      labels_url:
        'https://api.github.com/repos/Brend-Smits/octokit-test-repo/issues/17/labels{/name}',
      comments_url:
        'https://api.github.com/repos/Brend-Smits/octokit-test-repo/issues/17/comments',
      events_url:
        'https://api.github.com/repos/Brend-Smits/octokit-test-repo/issues/17/events',
      html_url: 'https://github.com/Brend-Smits/octokit-test-repo/issues/17',
      id: 925545239,
      node_id: 'MDU6SXNzdWU5MjU1NDUyMzk=',
      number: 17,
      title: 'Continuous Compliance - Valid test 👍',
      user: {
        login: 'Brend-Smits',
        id: 15904543,
        node_id: 'MDQ6VXNlcjE1OTA0NTQz',
        avatar_url: 'https://avatars.githubusercontent.com/u/15904543?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/Brend-Smits',
        html_url: 'https://github.com/Brend-Smits',
        followers_url: 'https://api.github.com/users/Brend-Smits/followers',
        following_url:
          'https://api.github.com/users/Brend-Smits/following{/other_user}',
        gists_url: 'https://api.github.com/users/Brend-Smits/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/Brend-Smits/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/Brend-Smits/subscriptions',
        organizations_url: 'https://api.github.com/users/Brend-Smits/orgs',
        repos_url: 'https://api.github.com/users/Brend-Smits/repos',
        events_url: 'https://api.github.com/users/Brend-Smits/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/Brend-Smits/received_events',
        type: 'User',
        site_admin: false
      },
      labels: [
        {
          id: 2833781834,
          node_id: 'MDU6TGFiZWwyODMzNzgxODM0',
          url:
            'https://api.github.com/repos/Brend-Smits/octokit-test-repo/labels/CC:%20Bypass',
          name: 'CC: Bypass',
          color: 'ededed',
          default: false,
          description: null
        },
        {
          id: 2833077558,
          node_id: 'MDU6TGFiZWwyODMzMDc3NTU4',
          url:
            'https://api.github.com/repos/Brend-Smits/octokit-test-repo/labels/automated',
          name: 'automated',
          color: 'ededed',
          default: false,
          description: null
        },
        {
          id: 2831776423,
          node_id: 'MDU6TGFiZWwyODMxNzc2NDIz',
          url:
            'https://api.github.com/repos/Brend-Smits/octokit-test-repo/labels/continuous-compliance',
          name: 'continuous-compliance',
          color: '99adc1',
          default: false,
          description: null
        }
      ],
      state: 'open',
      locked: false,
      assignee: null,
      assignees: [],
      milestone: null,
      comments: 3,
      created_at: '2021-06-20T08:09:17Z',
      updated_at: '2021-06-20T08:24:11Z',
      closed_at: '2021-06-20T08:24:06Z',
      author_association: 'OWNER',
      active_lock_reason: null,
      body:
        'Hi there 👋, \n' +
        ' Philips tries to make sure that repositories in this organization follow a certain standardization. While reviewing your repository, we could not stop ourselves to further improve this repository! \n' +
        ' \n' +
        ' We are happy to help you set up a nice Read me, please head over to Slack and we will get you set up. \n' +
        ' Auto-generated issue by Continuous Compliance\n' +
        ' Unique rule set ID: 89b2a899-0fab-423c-99b9-ed88d958f19d',
      performed_via_github_app: null
    }
    // Prepare by creating new options that can be passed to the different methods that we are testing.
    describe('in repository', () => {
      describe('with existing repolinter issues', () => {
        it('it should find them and return the issues', async () => {
          // Prepare
          const repoIssues = []
          repoIssues.push(githubIssue)

          nock('https://api.github.com')
            .get(
              `/repos/test/tester-repo/issues?labels=continuous-compliance%2Cautomated&state=all&sort=created&direction=desc`
            )
            .reply(200, repoIssues)

          // Act
          const issues = await InternalHelpers.findExistingRepolinterIssues(
            validOptions,
            'test',
            'tester-repo',
            new Octokit({
              auth: 'fake',
              baseUrl: 'https://api.github.com'
            })
          )

          // Assert
          expect(issues).to.have.lengthOf(1)
        })
        describe('without matching rule identifier', () => {
          it('it should create a new Github issue', async () => {
            // Prepare
            const issueWithDifferenRule = { ...githubIssue }
            issueWithDifferenRule.body =
              'Hi there 👋, \n' +
              ' Philips tries to make sure that repositories in this organization follow a certain standardization. While reviewing your repository, we could not stop ourselves to further improve this repository! \n' +
              ' \n' +
              ' According to our standards, we think the following can be improved: \n' +
              ' - Add a Read-me file to explain to other people what your repository is about. \n' +
              ' \n' +
              ' We are happy to help you set up a nice Read me, please head over to Slack and we will get you set up. \n' +
              ' Auto-generated issue by Continuous Compliance\n' +
              ' Unique rule set ID: 89b2a899-0fac-423c-99b9-ed88d958f19d'

            const repoIssues = []
            repoIssues.push(issueWithDifferenRule)
            mockStandardGithubApiCalls(repoIssues, issueWithDifferenRule)

            // Act
            const result = await GithubIssueCreate(null, validOptions, [], true)

            // Assert
            expect(result.message).to.equal('Github Issue 17 Created!')
          })
        })
        describe('with a valid Github issue', () => {
          describe('that is closed', () => {
            it('it should reopen the issue', async () => {
              // Prepare
              const closedIssue = { ...githubIssue }
              closedIssue.state = 'closed'
              closedIssue.labels = []
              const repoIssues = []
              repoIssues.push(closedIssue)
              mockStandardGithubApiCalls(repoIssues, closedIssue)

              nock('https://api.github.com')
                .patch(`/repos/test/tester-repo/issues/17`)
                .reply(200)

              nock('https://api.github.com')
                .post(`/repos/test/tester-repo/issues/17/comments`)
                .reply(200)

              // Act
              const result = await GithubIssueCreate(
                null,
                validOptions,
                [],
                true
              )

              // Assert
              expect(result.message).to.equal(
                'Github Issue 17 re-opened as there seems to be regression!'
              )
            })
          })
          describe('with a bypass label', () => {
            it('it should be able to find a bypass label', async () => {
              // Prepare
              const labels = [
                {
                  id: 2833781834,
                  node_id: 'MDU6TGFiZWwyODMzNzgxODM0',
                  url:
                    'https://api.github.com/repos/Brend-Smits/octokit-test-repo/labels/CC:%20Bypass',
                  name: 'CC: Bypass',
                  color: 'ededed',
                  default: false,
                  description: null
                }
              ]
              // Act
              const hasBypassLabelBeenApplied = await InternalHelpers.hasBypassLabelBeenApplied(
                validOptions,
                labels
              )

              // Assert
              // eslint-disable-next-line no-unused-expressions
              expect(hasBypassLabelBeenApplied).to.be.true
            })
            it('it should not create a new Github issue', async () => {
              // Prepare
              const repoIssues = []
              repoIssues.push(githubIssue)
              mockStandardGithubApiCalls(repoIssues, githubIssue)

              // Act
              const result = await GithubIssueCreate(
                null,
                validOptions,
                [],
                true
              )

              // Assert
              expect(result.message).to.equal(
                'Rule fix failed as Github Issue 17 has bypass label.'
              )
            })
          })

          describe('without a bypass label', () => {
            it('it should not be able to find a bypass label', async () => {
              // Act
              const hasBypassLabelBeenApplied = await InternalHelpers.hasBypassLabelBeenApplied(
                validOptions,
                []
              )

              // Assert
              // eslint-disable-next-line no-unused-expressions
              expect(hasBypassLabelBeenApplied).to.be.false
            })
          })

          describe('with unique rule identifier in body', () => {
            it('it should return the proper unique identifier of the issue', async () => {
              // Act
              const uniqueIdentifier = await InternalHelpers.retrieveRuleIdentifier(
                githubIssue.body
              )

              // Assert
              expect(uniqueIdentifier).to.be.equal(
                '89b2a899-0fab-423c-99b9-ed88d958f19d'
              )
            })
          })
        })
        describe('without a valid issue', () => {
          describe('without a unique rule identifier in body', () => {
            it('it should not return any unique identifier', async () => {
              // Prepare
              const invalidIssue = githubIssue
              invalidIssue.body =
                'Hi there 👋, \n' +
                ' Philips tries to make sure that repositories in this organization follow a certain standardization. While reviewing your repository, we could not stop ourselves to further improve this repository! \n' +
                ' \n' +
                ' According to our standards, we think the following can be improved: \n' +
                ' - Add a Read-me file to explain to other people what your repository is about. \n' +
                ' \n' +
                ' We are happy to help you set up a nice Read me, please head over to Slack and we will get you set up. \n' +
                ' Auto-generated issue by Continuous Compliance\n'

              // Act
              const uniqueIdentifier = await InternalHelpers.retrieveRuleIdentifier(
                invalidIssue.body
              )

              // Assert
              // eslint-disable-next-line no-unused-expressions
              expect(uniqueIdentifier).to.be.null
            })
          })
        })
      })
      describe('without existing repolinter issues', () => {
        it('it should not return any issues and be null', async () => {
          // Prepare
          nock('https://api.github.com')
            .get(
              `/repos/test/tester-repo/issues?labels=continuous-compliance%2Cautomated&state=all&sort=created&direction=desc`
            )
            .reply(200, [])

          // Act
          const issues = await InternalHelpers.findExistingRepolinterIssues(
            validOptions,
            'test',
            'tester-repo',
            new Octokit({
              auth: 'fake',
              baseUrl: 'https://api.github.com'
            })
          )

          // Assert
          // eslint-disable-next-line no-unused-expressions
          expect(issues).to.be.null
        })
        it('it should create a new Github issue', async () => {
          // Prepare
          mockStandardGithubApiCalls([], githubIssue)

          // Act
          const result = await GithubIssueCreate(null, validOptions, [], true)

          // Assert
          expect(result.message).to.equal(
            'No Open/Closed issues were found for this rule - Created new Github Issue with issue number - 17'
          )
        })
      })
    })
  })
})
