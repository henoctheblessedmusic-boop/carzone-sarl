# ECC Agents — index des rôles disponibles

> Source : dépôt ECC (affaan-m/ECC, MIT). Ces fichiers sont des fiches de rôle prêtes à être passées à un subagent DSH.
> Utilisation : lire le fichier du rôle voulu et l'inclure en tête du prompt subagent.

| Agent | Description |
|---|---|
| [a11y-architect](a11y-architect.md) | Accessibility Architect specializing in WCAG 2.2 compliance for Web and Native platforms. Use PROACTIVELY when designing UI compon… |
| [agent-evaluator](agent-evaluator.md) | Evaluates agent output against 5-axis quality rubric (accuracy, completeness, clarity, actionability, conciseness). Use after any … |
| [architect](architect.md) | Software architecture specialist for system design, scalability, and technical decision-making. Use PROACTIVELY when planning new … |
| [build-error-resolver](build-error-resolver.md) | Build and TypeScript error resolution specialist. Use PROACTIVELY when build fails or type errors occur. Fixes build/type errors o… |
| [chief-of-staff](chief-of-staff.md) | Personal communication chief of staff that triages email, Slack, LINE, and Messenger. Classifies messages into 4 tiers (skip/info_… |
| [code-architect](code-architect.md) | Designs feature architectures by analyzing existing codebase patterns and conventions, then providing implementation blueprints wi… |
| [code-explorer](code-explorer.md) | Deeply analyzes existing codebase features by tracing execution paths, mapping architecture layers, and documenting dependencies t… |
| [code-reviewer](code-reviewer.md) | Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing … |
| [code-simplifier](code-simplifier.md) | Simplifies and refines code for clarity, consistency, and maintainability while preserving behavior. Focus on recently modified co… |
| [comment-analyzer](comment-analyzer.md) | Analyze code comments for accuracy, completeness, maintainability, and comment rot risk. |
| [conversation-analyzer](conversation-analyzer.md) | Use this agent when analyzing conversation transcripts to find behaviors worth preventing with hooks. Triggered by /hookify withou… |
| [cpp-build-resolver](cpp-build-resolver.md) | C++ build, CMake, and compilation error resolution specialist. Fixes build errors, linker issues, and template errors with minimal… |
| [cpp-reviewer](cpp-reviewer.md) | Expert C++ code reviewer specializing in memory safety, modern C++ idioms, concurrency, and performance. Use for all C++ code chan… |
| [csharp-reviewer](csharp-reviewer.md) | Expert C# code reviewer specializing in .NET conventions, async patterns, security, nullable reference types, and performance. Use… |
| [dart-build-resolver](dart-build-resolver.md) | Dart/Flutter build, analysis, and dependency error resolution specialist. Fixes `dart analyze` errors, Flutter compilation failure… |
| [database-reviewer](database-reviewer.md) | PostgreSQL database specialist for query optimization, schema design, security, and performance. Use PROACTIVELY when writing SQL,… |
| [django-build-resolver](django-build-resolver.md) | Django/Python build, migration, and dependency error resolution specialist. Fixes pip/Poetry errors, migration conflicts, import e… |
| [django-reviewer](django-reviewer.md) | Expert Django code reviewer specializing in ORM correctness, DRF patterns, migration safety, security misconfigurations, and produ… |
| [docs-lookup](docs-lookup.md) | When the user asks how to use a library, framework, or API or needs up-to-date code examples, use Context7 MCP to fetch current do… |
| [doc-updater](doc-updater.md) | Documentation and codemap specialist. Use PROACTIVELY for updating codemaps and documentation. Generates docs/CODEMAPS/*, updates … |
| [e2e-runner](e2e-runner.md) | End-to-end testing specialist using Vercel Agent Browser (preferred) with Playwright fallback. Use PROACTIVELY for generating, mai… |
| [fastapi-reviewer](fastapi-reviewer.md) | Reviews FastAPI applications for async correctness, dependency injection, Pydantic schemas, security, OpenAPI quality, testing, an… |
| [flutter-reviewer](flutter-reviewer.md) | Flutter and Dart code reviewer. Reviews Flutter code for widget best practices, state management patterns, Dart idioms, performanc… |
| [fsharp-reviewer](fsharp-reviewer.md) | Expert F# code reviewer specializing in functional idioms, type safety, pattern matching, computation expressions, and performance… |
| [gan-evaluator](gan-evaluator.md) | "GAN Harness â€” Evaluator agent. Tests the live running application via Playwright, scores against rubric, and provides actionabl… |
| [gan-generator](gan-generator.md) | "GAN Harness â€” Generator agent. Implements features according to the spec, reads evaluator feedback, and iterates until quality … |
| [gan-planner](gan-planner.md) | "GAN Harness â€” Planner agent. Expands a one-line prompt into a full product specification with features, sprints, evaluation cri… |
| [go-build-resolver](go-build-resolver.md) | Go build, vet, and compilation error resolution specialist. Fixes build errors, go vet issues, and linter warnings with minimal ch… |
| [go-reviewer](go-reviewer.md) | Expert Go code reviewer specializing in idiomatic Go, concurrency patterns, error handling, and performance. Use for all Go code c… |
| [harmonyos-app-resolver](harmonyos-app-resolver.md) | HarmonyOS application development expert specializing in ArkTS and ArkUI. Reviews code for V2 state management compliance, Navigat… |
| [harness-optimizer](harness-optimizer.md) | Improve local agent-harness configuration reliability and cost using eval-driven grading (pass@k/pass^k) derived from the eval-har… |
| [healthcare-reviewer](healthcare-reviewer.md) | Reviews healthcare application code for clinical safety, CDSS accuracy, PHI compliance, and medical data integrity. Specialized fo… |
| [homelab-architect](homelab-architect.md) | Designs home and small-lab network plans from hardware inventory, goals, and operator experience level, with safe staged changes a… |
| [java-build-resolver](java-build-resolver.md) | Java/Maven/Gradle build, compilation, and dependency error resolution specialist. Automatically detects Spring Boot or Quarkus and… |
| [java-reviewer](java-reviewer.md) | Expert Java code reviewer for Spring Boot and Quarkus projects. Automatically detects the framework and applies the appropriate re… |
| [kotlin-build-resolver](kotlin-build-resolver.md) | Kotlin/Gradle build, compilation, and dependency error resolution specialist. Fixes build errors, Kotlin compiler errors, and Grad… |
| [kotlin-reviewer](kotlin-reviewer.md) | Kotlin and Android/KMP code reviewer. Reviews Kotlin code for idiomatic patterns, coroutine safety, Compose best practices, clean … |
| [loop-operator](loop-operator.md) | Operate autonomous agent loops, monitor progress, and intervene safely when loops stall. |
| [marketing-agent](marketing-agent.md) | Marketing strategist and copywriter for campaign planning, audience research, positioning, copy creation, and content review. Cove… |
| [mle-reviewer](mle-reviewer.md) | Production machine-learning engineering reviewer for data contracts, feature pipelines, training reproducibility, offline/online e… |
| [network-architect](network-architect.md) | Designs enterprise or multi-site network architecture from requirements, using existing network skills for focused routing, valida… |
| [network-config-reviewer](network-config-reviewer.md) | Reviews router and switch configurations for security, correctness, stale references, risky change-window commands, and missing op… |
| [network-troubleshooter](network-troubleshooter.md) | Diagnoses network connectivity, routing, DNS, interface, and policy symptoms with a read-only OSI-layer workflow and evidence-back… |
| [opensource-forker](opensource-forker.md) | Fork any project for open-sourcing. Copies files, strips secrets and credentials (20+ patterns), replaces internal references with… |
| [opensource-packager](opensource-packager.md) | Generate complete open-source packaging for a sanitized project. Produces CLAUDE.md, setup.sh, README.md, LICENSE, CONTRIBUTING.md… |
| [opensource-sanitizer](opensource-sanitizer.md) | Verify an open-source fork is fully sanitized before release. Scans for leaked secrets, PII, internal references, and dangerous fi… |
| [performance-optimizer](performance-optimizer.md) | Performance analysis and optimization specialist. Use PROACTIVELY for identifying bottlenecks, optimizing slow code, reducing bund… |
| [php-reviewer](php-reviewer.md) | Expert PHP code reviewer specializing in PSR-12 compliance, PHP type system, Eloquent ORM patterns, security, and performance. Use… |
| [planner](planner.md) | Expert planning specialist for complex features and refactoring. Use PROACTIVELY when users request feature implementation, archit… |
| [pr-test-analyzer](pr-test-analyzer.md) | Review pull request test coverage quality and completeness, with emphasis on behavioral coverage and real bug prevention. |
| [python-reviewer](python-reviewer.md) | Expert Python code reviewer specializing in PEP 8 compliance, Pythonic idioms, type hints, security, and performance. Use for all … |
| [pytorch-build-resolver](pytorch-build-resolver.md) | PyTorch runtime, CUDA, and training error resolution specialist. Fixes tensor shape mismatches, device errors, gradient issues, Da… |
| [rag-pipeline-reviewer](rag-pipeline-reviewer.md) | Reviews RAG (Retrieval-Augmented Generation) pipelines for retrieval quality, chunking strategy, embedding choices, and evaluation… |
| [react-build-resolver](react-build-resolver.md) | Diagnose and fix React build failures across Vite, webpack, Next.js, CRA, Parcel, esbuild, and Bun. Handles JSX/TSX compile errors… |
| [react-reviewer](react-reviewer.md) | Expert React/JSX code reviewer specializing in hook correctness, render performance, server/client component boundaries, accessibi… |
| [refactor-cleaner](refactor-cleaner.md) | Dead code cleanup and consolidation specialist. Use PROACTIVELY for removing unused code, duplicates, and refactoring. Runs analys… |
| [rust-build-resolver](rust-build-resolver.md) | Rust build, compilation, and dependency error resolution specialist. Fixes cargo build errors, borrow checker issues, and Cargo.to… |
| [rust-reviewer](rust-reviewer.md) | Expert Rust code reviewer specializing in ownership, lifetimes, error handling, unsafe usage, and idiomatic patterns. Use for all … |
| [security-reviewer](security-reviewer.md) | Security vulnerability detection and remediation specialist. Use PROACTIVELY after writing code that handles user input, authentic… |
| [seo-specialist](seo-specialist.md) | SEO specialist for technical SEO audits, on-page optimization, structured data, Core Web Vitals, and content/keyword mapping. Use … |
| [silent-failure-hunter](silent-failure-hunter.md) | Review code for silent failures, swallowed errors, bad fallbacks, and missing error propagation. |
| [spec-miner](spec-miner.md) | Extracts behavioral specs from existing codebases for OpenSpec. Produces flat Requirement and Invariant blocks with structured met… |
| [swift-build-resolver](swift-build-resolver.md) | Swift/Xcode build, compilation, and dependency error resolution specialist. Fixes swift build errors, Xcode build failures, SPM de… |
| [swift-reviewer](swift-reviewer.md) | Expert Swift code reviewer specializing in protocol-oriented design, value semantics, ARC memory management, Swift Concurrency, an… |
| [tdd-guide](tdd-guide.md) | Test-Driven Development specialist enforcing write-tests-first methodology. Use PROACTIVELY when writing new features, fixing bugs… |
| [type-design-analyzer](type-design-analyzer.md) | Analyze type design for encapsulation, invariant expression, usefulness, and enforcement. |
| [typescript-reviewer](typescript-reviewer.md) | Expert TypeScript/JavaScript code reviewer specializing in type safety, async correctness, Node/web security, and idiomatic patter… |
| [vue-reviewer](vue-reviewer.md) | Expert Vue.js code reviewer specializing in Composition API correctness, reactivity pitfalls, component architecture, template sec… |
| [copy-humanizer](copy-humanizer.md) | Rôle humaniseur de copy FR/EN/ZH — réécrit les textes UI générés par IA en style humain, irrégulier, sans toucher au code fonctionnel. |

