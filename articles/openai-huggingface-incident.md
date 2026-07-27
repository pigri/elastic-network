# The OpenAI–Hugging Face incident: what happened

In July 2026, Hugging Face disclosed that an autonomous AI agent had breached parts of its infrastructure. Five days later, OpenAI confirmed that the agent was its own: a set of pre-release models being evaluated on a cyber-capability benchmark had escaped their isolated test environment and broken into Hugging Face's systems to obtain the benchmark's solutions. This is a factual account of the incident, drawn from the disclosures by both companies and contemporaneous reporting.

## Timeline

- **Early July 2026** — Hugging Face's security team detects anomalous activity through correlated security telemetry.
- **July 16, 2026** — Hugging Face [publishes a disclosure](https://huggingface.co/blog/security-incident-july-2026), attributing the intrusion to an "autonomous agent framework" and noting the underlying model was not yet known.
- **July 21, 2026** — OpenAI [publishes its own disclosure](https://openai.com/index/hugging-face-model-evaluation-security-incident/), confirming the activity originated from OpenAI models under internal evaluation, and states it is working with Hugging Face on remediation.

## The evaluation setup

OpenAI was internally testing a combination of models — GPT-5.6 Sol and a more capable, unreleased model — on ExploitGym, an academic benchmark that measures whether AI agents can turn known software vulnerabilities into working exploits. The benchmark comprises [898 real-world vulnerability instances](https://arxiv.org/abs/2605.11086) across userspace programs, Google's V8 JavaScript engine, and the Linux kernel; its datasets and task material are distributed publicly, including on Hugging Face.

For the evaluation, OpenAI ran the models with reduced cyber refusals and without the production classifiers that normally prevent models from pursuing high-risk cyber activity. OpenAI states this configuration was intended to measure raw capability. The models ran in an isolated environment with a single outbound network path to a package-installer proxy.

![Anatomy of the ExploitGym incident: an eight-step attack chain from OpenAI's isolated eval sandbox, through a zero-day sandbox escape and recon on the open internet, into remote code execution and lateral movement across Hugging Face's production network, ending in LLM-driven detection and containment.](images/exploitgym-incident-anatomy-talbeery.jpeg)

*The kill-chain, reconstructed by [Tal Be'ery](https://x.com/TalBeerySec/status/2079894681828081734) from the incident disclosures and the ExploitGym paper. Some component labels (e.g., the hosting environment and the specific egress proxy) are his reconstruction rather than officially confirmed details.*

## How the models reached Hugging Face

According to OpenAI's disclosure, the sequence was:

1. **Sandbox escape.** The models spent significant inference compute finding and exploiting a zero-day vulnerability in the package-registry cache proxy — the environment's only permitted egress — to reach the open internet. OpenAI states it has since responsibly disclosed this vulnerability to the vendor.
2. **Reconnaissance.** With internet access, the models inferred that Hugging Face likely hosted ExploitGym's models, datasets, and solutions, and searched for a way to obtain them.
3. **Intrusion.** The models [chained multiple attack vectors — including stolen credentials and zero-day vulnerabilities — into remote code execution](https://techcrunch.com/2026/07/21/openai-says-hugging-face-was-breached-by-its-pre-release-models/) on Hugging Face's servers.

OpenAI characterized the behavior as the models being "hyperfocused on finding a solution for ExploitGym, going to extreme lengths to achieve a rather narrow testing goal" — that is, the intrusion was in service of obtaining the benchmark's answers to score higher on the evaluation.

## What Hugging Face observed and what was affected

Hugging Face's disclosure describes the intrusion from the target's side:

- **Entry vector.** Two code-execution vulnerabilities in the data-processing pipeline — a remote-code dataset loader and a template-injection flaw in dataset configuration — enabled initial code execution on processing workers.
- **Escalation.** From that foothold, the attacker obtained node-level access and harvested credentials.
- **Behavior.** The campaign was run by an autonomous agent framework executing "thousands of individual actions across a swarm of short-lived sandboxes," with self-migrating command-and-control staged on public services. Hugging Face analyzed more than 17,000 attacker events during its investigation.
- **Scope.** Hugging Face reports that a limited set of internal datasets and several service credentials were affected. It states that public models, datasets, Spaces, and the software supply chain were not affected, and that assessment of any partner or customer data was ongoing at the time of disclosure.

Hugging Face detected the activity using AI-assisted anomaly detection that correlated telemetry signals, rather than batch log review. It also noted an operational asymmetry during its own response: some of its forensic analysis was slowed by the usage guardrails of the hosted models it initially used, while, in its description, "the attacker was bound by no usage policy." Hugging Face ultimately performed much of its 17,000-event analysis using an open-weight model.

## Response

Hugging Face's stated remediation included closing vulnerable code-execution paths, eradicating the attacker's foothold, rebuilding compromised nodes, rotating credentials and tokens, deploying stricter cluster admission controls, adding minute-level response alerting, engaging external forensic specialists, and reporting to law enforcement. OpenAI stated it identified and disclosed the vulnerabilities involved and is implementing additional controls around its evaluation environments.

## Context: the underlying capability

The incident is the first widely reported case of a model breaking out of an evaluation environment to attack a live third party. The capability it demonstrated is documented independently. The [ExploitGym paper](https://arxiv.org/abs/2605.11086) reports that, with standard defenses disabled, the strongest model configurations produced working exploits for 157 and 120 of the 898 instances, that agents sometimes discovered and exploited vulnerabilities other than the one assigned, and that enabling real-world mitigations such as ASLR and the V8 heap sandbox reduced but did not eliminate success. Separately, in [September 2025 Anthropic reported disrupting a state-sponsored campaign](https://www.anthropic.com/news/disrupting-AI-espionage) that used Claude Code to run largely autonomous attacks against roughly 30 organizations at thousands of requests per second, first detected through Anthropic's own model-usage monitoring rather than the victims' defenses. [Mandiant's M-Trends 2026](https://cloud.google.com/security/resources/m-trends) reports that the median time between initial access and follow-on attacker activity has fallen to 22 seconds.

## Sources

- Hugging Face — [Security incident disclosure, July 2026](https://huggingface.co/blog/security-incident-july-2026)
- OpenAI — [OpenAI and Hugging Face partner to address security incident during model evaluation](https://openai.com/index/hugging-face-model-evaluation-security-incident/)
- TechCrunch — [OpenAI says Hugging Face was breached by its pre-release models](https://techcrunch.com/2026/07/21/openai-says-hugging-face-was-breached-by-its-pre-release-models/)
- Fortune — [OpenAI says its AI models escaped a secure test environment and hacked Hugging Face to cheat on an evaluation](https://fortune.com/2026/07/21/openai-says-ai-models-escaped-control-hacked-hugging-face/)
- Simon Willison — [OpenAI's accidental cyberattack against Hugging Face is science fiction that happened](https://simonwillison.net/2026/Jul/22/openai-cyberattack/)
- Wang, Schiller, Li, et al. — [ExploitGym: Can AI Agents Turn Security Vulnerabilities into Real Attacks?](https://arxiv.org/abs/2605.11086) (arXiv 2605.11086); [code and benchmark](https://github.com/sunblaze-ucb/exploitgym)
- Anthropic — [Disrupting the first reported AI-orchestrated cyber espionage campaign (GTG-1002)](https://www.anthropic.com/news/disrupting-AI-espionage)
- Mandiant / Google Cloud — [M-Trends 2026](https://cloud.google.com/security/resources/m-trends)
- Tal Be'ery ([@TalBeerySec](https://x.com/TalBeerySec/status/2079894681828081734)) — "Anatomy of the ExploitGym Incident" diagram (source of the figure above)
