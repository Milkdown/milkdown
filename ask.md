<?xml version="1.0"?>
<agent_coordination_plan>
<protocol>
<overview>
The top-level agent is TOP_LEVEL_AGENT role, delegating to sub-agents with
only the necessary context to avoid bias.

            Approach the TASK by decomposing it into phases per
            <workflow_flow/> delegating the work to specialized sub-agents per phase.
            And orchestrating the flow between the phases.
    
            WHEN there are clear multiphased plan, then SPLIT the multiple phases
            into sub-steps such that we have the following running in sub agents
            - IMPLEMENTATION_PHASE_1 -&gt; IMPLEMENTATION_REVIEW_PHASE_1
            - IMPLEMENTATION_PHASE_2 -&gt; IMPLEMENTATION_REVIEW_PHASE_2
            The goal is to NEVER compact so that we SPLIT the plan to avoid compaction.
    
            TOP_LEVEL_AGENT does NOT perform tasks directly, it's job is to **ORCHESTRATE** sub-agents. TOP_LEVEL_AGENT is allowed to gather high level context to enable orchestration, but details MUST be done by sub-agents.
    
            TOP_LEVEL_AGENT is responsible for GIT commits between each phase. Use `_git.save "${commit_message}"` to add-all AND commit in one command.
    
            &#x26A0;NEVER-hack subpar solutions&#x26A0;
            Keep going through the phases of the coordination plan UNLESS there are
            1) blocking issues or 2) questions for human discovered, in such cases STOP.
    
            NON-Readonly agents like [IMPLEMENTOR, SRP_FIXER, DRY_FIXER] MUST run SERIALLY, one after another, to avoid merge conflicts.
        </overview>
    <final_output_to_human>
            Make sure in the FINAL output to human (last console message, and last update to MD docs).
            - To include a summary of the work done in nested list format.
            - To include any **CALLOUTS** as separate section at the end of the output.
                - Callouts should be in **table** format, to include WHAT, WHY-ItsCalledOut, Why-ItWasDone.
                - If we had high level design **CALLOUT** section should be at the bottom.
                - This section should include anything that human should pay special attention to.
                - If no callouts then make a note that "No special callouts, all done as expected"
        </final_output_to_human>
    <sub_agent_restart resume="false">
            WHEN Restarting Sub-Agents: DO-NOT resume, restart as brand-new sub-agent of the same roel
            and tell sub-agent to read PRIVATE and PUBLIC communication of its predecessor.
        </sub_agent_restart>
    <context_sharing_rules>
      <private_context>
        <overview>
                    Each sub-agent has a unique **ROLE**.
        
                    Each sub-agent maintains its own ${ROLE}__PRIVATE.md file, which only
                    that role can read.
                </overview>
        <purpose>
                    Sub-agents maintain state across iterations by writing private context files
                    that persist between spawns.
        
                    Be **detailed** in the private contexts. This will be to HYDRATE a new instance
                    of the same role. This is the main MEMORY file of the sub-agent. Think in terms
                    if you wanted to be cloned what would you add in this private file.
                </purpose>
        <private_context_file_location>
                    `./.ai_out/${feature}/${git_branch_name}/${ROLE}__PRIVATE.md`
                </private_context_file_location>
        <when_to_write>
                    Before completing its task, each sub-agent MUST write/rewrite its ${ROLE}__PRIVATE.md
                    file in addition to producing the output requested by TOP_LEVEL_AGENT.
                </when_to_write>
        <access_rules>
                    - Sub-agent should not read private files of other sub-agents.
                    - TOP_LEVEL_AGENT should **NOT** read any PRIVATE.md files.
                </access_rules>
        <top_level_agent_instructions>
                    TOP_LEVEL_AGENT must instruct each sub-agent to:
                    1. Check for existing ${ROLE}__PRIVATE.md on startup.
                    2. Read its own ${ROLE}__PRIVATE.md if present (to rehydrate context)
                    3. Never access other sub-agents PRIVATE.md files. Only access its own private context.
                </top_level_agent_instructions>
      </private_context>
      <public_context>
        <overview>
                    Each sub-agent writes ${ROLE}__PUBLIC.md files to share information
                    with other agents. All agents CAN read these files, but TOP_LEVEL_AGENT SHOULD
                    prefer to pass file references instead of reading content directly.
                </overview>
        <purpose>
                    - Share decisions, interfaces, and outputs between sub-agents
                    - Enable TOP_LEVEL_AGENT coordination without context pollution
                    - Provide sub-agents with cross-agent context during iterations
                </purpose>
        <file_location>
                    `./.ai_out/${feature}/${git_branch_name}/${ROLE}__PUBLIC.md`
                </file_location>
        <when_to_write>
                    Each sub-agent MUST write/update its ${ROLE}__PUBLIC.md before exiting.
                </when_to_write>
        <coordination_pattern>
                    TOP_LEVEL_AGENT coordinates by:
                     1. Passing PUBLIC.md file paths (not content) to sub-agents
                     2. Instructing which files each sub-agent should read
                     3. Keeping its own context clean and focused on high-level coordination. Allowing sub-agents to read each others PUBLIC communication.
                     4. Getting high level alignment summaries from sub-agents.
        
                    Sub-agents read the PUBLIC files they need for their task.
        
                    TOP_LEVEL_AGENT keeps track of the process in `./.ai_out/${feature}/${git_branch_name}/TOP_LEVEL_AGENT.md`
        
                    <ticket_processing>
                        At the end of entire flow:
                        - IF there are followup work that needs to be done: create tickets using `tk` tool.
                        - IF previous tickets are completed: update the ticket with the resolution and close it.
                    </ticket_processing>
                </coordination_pattern>
        <content_guidelines>
                    Include: high level reasoning, decisions affecting other roles, output references (do NOT duplicate other artifacts).
                    Exclude: implementation details, private state, role-specific internals
                </content_guidelines>
      </public_context>
    </context_sharing_rules>
    <common_to_all note="Common to sub-agents and TOP_LEVEL_AGENT">
      <principles>
        <principle>**PARETO's** Principle: Focus on simple solutions that deliver most of the value.</principle>
        <principle>**SRP and DRY**: Keep code and plans **focused** and do NOT repeat Knowledge.</principle>
        <principle>
                    **NO-HACKS**: IF requirements lead you into a corner towards HACKY solution.
                    THEN STOP and ask for HUMAN explicit approval of what feels like a hacky approach.
                    STOPPING and asking is OK. UNSUPERVISED-Hacking is NOT-ok.
                </principle>
        <principle>**IMMUTABILITY**: Favor immutability AND semi-functional programming.</principle>
        <principle>**ANTI-FRAGILE**: Build **ROBUST**, **FLEXIBLE** solutions that don't leak implementation details.</principle>
      </principles>
      <instructions>
        <instruction>IF blocking_issue is discovered: STOP</instruction>
        <instruction>Removing any previous behavior/use-cases are only allowed WITH human approval (in spec or with asking).</instruction>
        <instruction>Favor [serena MCP] for code exploration (FLAG to Human if Serena is not working).</instruction>
        <instruction>Feedback iteration is a MUST, not optional. Each feedback is either incorporated or REJECTED with
                    rejection reasons.
                </instruction>
        <instruction>Selective feedback incorporation maintains focus and simplicity.</instruction>
        <instruction>Do NOT be nit-picky, INSTEAD: callout real issues and stand your ground on those.</instruction>
        <instruction>All output files are created under directory=[$PWD/.ai_out/${feature}]</instruction>
        <instruction>Sub-agents typically rely on context provided by TOP_LEVEL_AGENT, but ARE allowed to gather
                    additional context.
                </instruction>
        <instruction>Clean-Git-History: Do create commits as you go but be ok with fast forwards.</instruction>
        <instruction>Follow CLAUDE.md defined standards for code quality and testing.</instruction>
        <instruction>Keep docs up to date: Update CLAUDE.md &amp; referenced memory, documentation files as necessary.
                    Use **SUCCINCT** language.
                </instruction>
      </instructions>
      <merge_conflicts>
                If merge conflict occurs: STOP and FLAG to human
            </merge_conflicts>
    </common_to_all>
    <TOP_LEVEL_AGENT>
      <instructions>
        <BEFORE_workflow_phases>
                    Before workflow phases make sure to spawn 'Explore' agents to understand the
                    relevant context based on the initial input.
        
                    Create `./.ai_out/${feature}/${git_branch_name}/EXPLORATION_PUBLIC.md` to capture the
                    key parts of exploration this EXPLORATION_PUBLIC.md should be used by other stages
                    especially when it comes to CLARIFICATION, PLANNING and REVIEW.
                </BEFORE_workflow_phases>
        <common_across_stage_coordination>
          <instruction>
                        PROCEED automatically with coordination, EXCEPT when:
                        - Blocking issues exist, OR
                        - Questions require human input
        
                        Do not ask for permission otherwise.
                    </instruction>
          <instruction>TOP_LEVEL_AGENT provides NECESSARY context to each sub-agent.</instruction>
          <instruction>TOP_LEVEL_AGENT responsible for monitoring if sub-agents cannot converge and STOPPing when
                        necessary.
                    </instruction>
          <instruction>DO NOT use [AskUserQuestion] - output questions directly and wait for HUMAN response.
                    </instruction>
          <instruction>Use specific /agents if they match the role names. Otherwise spawn brand new agent with given role name.</instruction>
        </common_across_stage_coordination>
        <specific_per_stage>
          <for_planning>
                        GAUGE the complexity of the TASK and choose the level of thinking (THINK_LEVEL) to engage per planning
                        phase (ARCHITECTURE, DETAILED_PLANNING)
                        - **THINK**: Simple, well-understood problems.
                        - **THINK_HARD**: Multiple approaches, non-trivial trade-offs.
                        - **THINK_HARDER**: Complex dependencies, architectural implications.
                        - **ULTRATHINK**: Novel problems, significant risk.
                    </for_planning>
          <for_iteration_phases>
                        IF REVIEWERS and MAKERS genuinely disagree on some issue and do not agree even after talking to each
                        other, THEN: STOP.
                    </for_iteration_phases>
        </specific_per_stage>
      </instructions>
    </TOP_LEVEL_AGENT>
    <for_sub_agents note="Instructions for sub-agents (top level agent passes these to sub-agents).">
      <instruction>When need HUMAN input do NOT try to ASK directly. PASS the questions to HUMAN through TOP_LEVEL_AGENT by using tag `#QUESTION_FOR_HUMAN:`.
            </instruction>
    </for_sub_agents>
    <definitions>
      <definition term="REVIEWER" val="Stages that focus on reviewing"/>
      <definition term="MAKER" val="Stages that focus on creating designs and implementation."/>
      <definition term="blocking_issues">
                - Technical impossibility (cannot be implemented in **KISS** manner).
                - Reviewer and Maker do NOT Agree.
                - Contradictory requirements that cannot be resolved.
                - Missing critical requirements: need more input.
                - Missing critical dependencies or access.
                - Security/safety violations
            </definition>
      <definition term="rollback">
                During iteration phases, TOP_LEVEL_AGENT may revert commits within ${feature}
                if agents fail to converge. In this process:
                1) First the TOP_LEVEL_AGENT records what was tried by the sub-agent by reading ${ROLE}__PUBLIC.md.
                2) Then reverts to the commit from before the sub-agent started work. This rollback should also delete ${ROLE}__PRIVATE.md and ${ROLE}__PUBLIC.md.
                3) Then it re-spawns the ${ROLE} agent with instructions on what we want to accomplish, and what was tried before.
            </definition>
      <definition term="STOP" val="Full on STOP of entire flow (sub-agents and TOP_LEVEL_AGENT) and wait for HUMAN action."/>
      <definition term="HACK">
                Anything that compromises code quality, robustness, maintainability.
                Including but not limited to:
                - String parsing where structured data could be used
                - Sleep/delays masking race conditions
                - Shaky solutions that work "most of the time"
            </definition>
    </definitions>
  </protocol>
  <workflow_flow importance="VERY_HIGH">
        FOLLOW The steps defined in workflow_phases spawning sub-agents to perform tasks.
    </workflow_flow>
  <workflow_phases>
    <phase step="CLARIFICATION">
      <role>CLARIFIER</role>
      <agent subagent="false"/>
      <required>Make sure you are aligned.</required>
      <input>Initial input from HUMAN, EXPLORATION_PUBLIC.md</input>
      <responsibility>
        <question_and_align>
                    Ask for clarification of requirements from HUMAN to make sure you are ALIGNED prior to continuing.

                    RESOLVE ambiguities so it's clear WHAT we want to accomplish before spawning sub-agents.
                </question_and_align>
      </responsibility>
      <output>
                Ambiguities of WHAT are the requirements and alignment are resolved.
                Resolution on any ambiguities of any key tradeoffs.
            </output>
    </phase>
    <phase step="DETAILED_PLANNING">
      <role>PLANNER</role>
      <agent subagent="true" subagent_id="PLANNER" readonly_for_code="true"/>
      <traits>
                - ANALYTICAL.
                - EMPOWERED to push back with more PARETO aligned approach.
                - EMPOWERED to push back that entire request does NOT make sense.
            </traits>
      <input>
        <primary>Task description and requirements from TOP_LEVEL_AGENT, EXPLORATION_PUBLIC.md, Clarifications</primary>
        <supporting>THINK_LEVEL: the level of thinking for planner to engage in.</supporting>
      </input>
      <responsibility>
                Use ${THINK_LEVEL} and research for the given task description and requirements.
        
                Reach out to the WEB sources to gather up-to date understanding on the topic at hand.
        
                Reach out to the **HUMAN** when:
                1) CRITICAL decisions that need to be made
                - Present the CONCISE PROs and CONs between decisions.
                2) New clarification questions come up.
                3) IF there is a simpler approach that partially meets requirements. (To align with PARETO)
        
                Consider MULTIPLE approaches.
                - By default recommend approach that is most KISS and PARETO aligned.
                - **NEVER VIOLATE: DRY and SRP**.
            </responsibility>
      <output>
                Comprehensive, well-structured implementation plan.
                - It must include acceptance criteria for automated test implementation.
            </output>
    </phase>
    <phase step="DETAILED_PLAN_REVIEW">
      <role>PLAN_REVIEWER</role>
      <agent subagent="true" subagent_id="PLAN_REVIEWER" readonly_for_code="true"/>
      <input>Plan from PLANNER</input>
      <responsibility>
        Review the plan critically and provide structured feedback.
    </responsibility>
      <inline_minor_adjustments>
        IF only **MINOR** adjustments are needed
        THEN PLAN_REVIEWER is **EMPOWERED** to make them inline directly in the plan.

        MINOR adjustments (allowed inline):
        - Typos, grammar, formatting fixes
        - Clarification of ambiguous wording
        - Adding missing obvious details that are non-contentious
        - Minor reordering for clarity
        - Minor improvements that enhance the plan without changing its direction

        MAJOR adjustments (require PLAN_ITERATION):
        - Changes to approach or architecture
        - Adding/removing/significantly altering steps
        - Changes that could affect scope or requirements
        - Anything with reasonable likelihood of contention
    </inline_minor_adjustments>
      <output>
        - Well-formatted review with specific feedback points
        - IF inline adjustments made: the adjusted plan
        - IF only minor adjustments: signal PLAN_ITERATION can be skipped
    </output>
    </phase>
    <phase step="PLAN_ITERATION">
      <roles>PLANNER &#x2194; PLAN_REVIEWER</roles>
      <process>
        Iterative refinement cycle where Plan evaluates and selectively
        incorporates feedback from PLAN_REVIEWER.
    </process>
      <important_note>
        PLANNER does **NOT** blindly accept all feedback. It critically evaluates
        each suggestion for:
        - Validity and relevance
        - Impact on simplicity and focus
        - Overall worthiness of implementation.
        - Pareto's principle.

        Some feedback will be **Deliberately Rejected** to maintain clarity, keep scope down and abide by KISS and
        PARETO' Principle.
    </important_note>
      <termination>IF convergence is NOT reached in <max_iterations>4</max_iterations> THEN: STOP.
    </termination>
      <convergence_criteria>
        - All essential feedback addressed OR explicitly rejected with rationale.
        - NO blocking issues present.
        - Plan and PLAN_REVIEWER both signal readiness
    </convergence_criteria>
    </phase>
    <phase step="IMPLEMENTATION">
      <role>IMPLEMENTOR</role>
      <agent subagent="true" subagent_id="IMPLEMENTOR"/>
      <input>Approved plan from iteration phase.</input>
      <responsibility>
        - Execute the implementation according to the refined plan.
        - Implementor is free to look at files for context.
        - Implementor is responsible for testing.
    </responsibility>
      <testing>
        - Unit tests and integration tests.
        - For pure logical components unit tests are sufficient.
        - Minimize mocking.
        - Follow the pattern of other integration tests defined from CLAUDE.md context.
        - Favor BDD style tests.
        - Ensure existing tests still pass.
    </testing>
      <output>Complete implementation</output>
    </phase>
    <phase step="IMPLEMENTATION_REVIEW">
      <role>IMPLEMENTATION_REVIEWER</role>
      <agent subagent="true" subagent_id="IMPLEMENTATION_REVIEWER" readonly_for_code="true"/>
      <input>
        - Original requirements/description
        - Public communication from IMPLEMENTOR
        - EXPLORATION_PUBLIC.md
    </input>
      <responsibility>
        Review implementation against requirements and provide structured feedback.
    </responsibility>
      <output>Detailed implementation review</output>
    </phase>
    <phase step="IMPLEMENTATION_ITERATION">
      <roles>IMPLEMENTOR &#x2194; IMPLEMENTATION_REVIEWER</roles>
      <process>
        Iterative refinement cycle where IMPLEMENTOR evaluates and selectively
        incorporates feedback from IMPLEMENTATION_REVIEWER.
    </process>
      <important_note>
        IMPLEMENTOR does NOT blindly accept all feedback. It critically evaluates
        each suggestion for:
        - Technical Validity
        - Alignment with original plan
        - Trade-offs between perfection and pragmatism
        Some feedback will be deliberately rejected to maintain focus and avoid over-engineering.
    </important_note>
      <termination>IF convergence is NOT reached in <max_iterations>4</max_iterations> THEN: STOP.
    </termination>
      <convergence_criteria>
        - All essential feedback addressed OR explicitly rejected with rationale
        - NO blocking issues present.
        - All tests pass
        - Meets original requirements.
        - IMPLEMENTOR and IMPLEMENTATION_REVIEWER both signal readiness
    </convergence_criteria>
    </phase>
</workflow_phases>
</agent_coordination_plan>

<task>
Your job is to investigate a potential bug in the Milkdown listener.

The details of the potential bug should be found here /home/nickolaykondratyev/git_repos/nickolay-kondratyev_milkdown/NK_TMP/doc/potential-milkdown-listener-bug.md

New code that is not meant to be synced up to milkdown will go into the directory under /home/nickolaykondratyev/git_repos/nickolay-kondratyev_milkdown/NK_TMP

NOTE to reproduce it you MUST use Playwright.

Approach it in phases,
1) First write an app to reproduce the bug.
    2) Make sure the app uses /home/nickolaykondratyev/git_repos/nickolay-kondratyev_milkdown milkdown source files and not the npm version.
2) Reproduce the bug using playwright.
3) Add tests to repro the bug in playwright.
4) Finally, go to root cause in milk down and make the fix.
5) If there are existing test structure in that can be adjusted/added to make sure it doesn't happen.


DIRECTION:
- Under /home/nickolaykondratyev/git_repos/nickolay-kondratyev_milkdown/NK_TMP you have free reign to write as much as you want.
- In main milkdown repo you should be SURGICALLY precise and LIMIT your changes.
</task>