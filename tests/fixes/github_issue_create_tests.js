const { expect } = require('chai')

describe('fixes', () =>
{
  describe('github-issue-create', () =>
  {
    const GithubIssueCreate = require('../../fixes/github-issue-create')
    const InternalHelpers = require('../../fixes/helpers/github-issue-create-helpers')

    const validOptions = {
      issueCreator: 'Philips - Continuous Compliance',
      issueLabels: [ 'continuous-compliance', 'automated' ],
      bypassLabel: 'CC: Bypass',
      issueTitle: 'Continuous Compliance - Valid test 👍',
      issueBody: 'Hi there 👋, \n' +
        ' Philips tries to make sure that repositories in this organization follow a certain standardization. While reviewing your repository, we could not stop ourselves to further improve this repository! \n' +
        ' We are happy to help you set up a nice Read me, please head over to Slack and we will get you set up. \n' +
        ' Auto-generated issue by Continuous Compliance',
      commentBody: "Hey, it's me, I am back😎. \n" +
        ' We noticed regression on this issue, so we opened and updated it. \n' +
        " If you want to bypass the check for this rule, attach the 'CC: Bypass' label. \n" +
        ' Thanks!',
      uniqueRuleId: '89b2a899-0fab-423c-99b9-ed88d958f19d'
    }

    const githubIssue = {
      url: 'https://api.github.com/repos/Brend-Smits/octokit-test-repo/issues/17',
      repository_url: 'https://api.github.com/repos/Brend-Smits/octokit-test-repo',
      labels_url: 'https://api.github.com/repos/Brend-Smits/octokit-test-repo/issues/17/labels{/name}',
      comments_url: 'https://api.github.com/repos/Brend-Smits/octokit-test-repo/issues/17/comments',
      events_url: 'https://api.github.com/repos/Brend-Smits/octokit-test-repo/issues/17/events',
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
        following_url: 'https://api.github.com/users/Brend-Smits/following{/other_user}',
        gists_url: 'https://api.github.com/users/Brend-Smits/gists{/gist_id}',
        starred_url: 'https://api.github.com/users/Brend-Smits/starred{/owner}{/repo}',
        subscriptions_url: 'https://api.github.com/users/Brend-Smits/subscriptions',
        organizations_url: 'https://api.github.com/users/Brend-Smits/orgs',
        repos_url: 'https://api.github.com/users/Brend-Smits/repos',
        events_url: 'https://api.github.com/users/Brend-Smits/events{/privacy}',
        received_events_url: 'https://api.github.com/users/Brend-Smits/received_events',
        type: 'User',
        site_admin: false
      },
      labels: [
        {
          id: 2833781834,
          node_id: 'MDU6TGFiZWwyODMzNzgxODM0',
          url: 'https://api.github.com/repos/Brend-Smits/octokit-test-repo/labels/CC:%20Bypass',
          name: 'CC: Bypass',
          color: 'ededed',
          default: false,
          description: null
        },
        {
          id: 2833077558,
          node_id: 'MDU6TGFiZWwyODMzMDc3NTU4',
          url: 'https://api.github.com/repos/Brend-Smits/octokit-test-repo/labels/automated',
          name: 'automated',
          color: 'ededed',
          default: false,
          description: null
        },
        {
          id: 2831776423,
          node_id: 'MDU6TGFiZWwyODMxNzc2NDIz',
          url: 'https://api.github.com/repos/Brend-Smits/octokit-test-repo/labels/continuous-compliance',
          name: 'continuous-compliance',
          color: '99adc1',
          default: false,
          description: null
        }
      ],
      state: 'closed',
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
      body: 'Hi there 👋, \n' +
        ' Philips tries to make sure that repositories in this organization follow a certain standardization. While reviewing your repository, we could not stop ourselves to further improve this repository! \n' +
        ' \n' +
        ' We are happy to help you set up a nice Read me, please head over to Slack and we will get you set up. \n' +
        ' Auto-generated issue by Continuous Compliance\n' +
        ' Unique rule set ID: 89b2a899-0fab-423c-99b9-ed88d958f19d',
      performed_via_github_app: null
    }

    // Prepare by creating new options that can be passed to the different methods that we are testing.

    describe('with valid Github issue', () => {

      it('with bypass label', async () =>
      {
        //Prepare
        const labels = [{
          id: 2833781834,
          node_id: 'MDU6TGFiZWwyODMzNzgxODM0',
          url: 'https://api.github.com/repos/Brend-Smits/octokit-test-repo/labels/CC:%20Bypass',
          name: 'CC: Bypass',
          color: 'ededed',
          default: false,
          description: null
        }]
        //Act
        const hasBypassLabelBeenApplied = await InternalHelpers.hasBypassLabelBeenApplied(validOptions, labels);

        //Assert
        expect(hasBypassLabelBeenApplied).to.be.true;
      })

      it('without bypass label', async () => {
        //Act
        const hasBypassLabelBeenApplied = await InternalHelpers.hasBypassLabelBeenApplied(validOptions, []);

        //Assert
        expect(hasBypassLabelBeenApplied).to.be.false;
      })
    })
    it('with unique rule identifier in body', async () => {
      // Test with an issue where a valid rule identifier is in the body
      // Prepare
      const validIssue = githubIssue

      // Act
      const uniqueIdentifier = await InternalHelpers.retrieveRuleIdentifier(validIssue.body)

      // Assert
      expect(uniqueIdentifier).to.be.equal('89b2a899-0fab-423c-99b9-ed88d958f19d')
    })
  describe('without a valid issue', () => {
    it('without unique rule identifier in body', async () => {
            // Prepare
            const invalidIssue = githubIssue
            invalidIssue.body = 'Hi there 👋, \n' +
            ' Philips tries to make sure that repositories in this organization follow a certain standardization. While reviewing your repository, we could not stop ourselves to further improve this repository! \n' +
            ' \n' +
            ' According to our standards, we think the following can be improved: \n' +
            ' - Add a Read-me file to explain to other people what your repository is about. \n' +
            ' \n' +
            ' We are happy to help you set up a nice Read me, please head over to Slack and we will get you set up. \n' +
            ' Auto-generated issue by Continuous Compliance\n'

            // Act
            const uniqueIdentifier = await InternalHelpers.retrieveRuleIdentifier(invalidIssue.body)

            // Assert
            expect(uniqueIdentifier).to.be.null
    })
  })
})
})
