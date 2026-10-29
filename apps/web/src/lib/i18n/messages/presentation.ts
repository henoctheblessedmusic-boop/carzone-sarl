import type { Locale } from "@/lib/prefs";

export type SceneCopy = {
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  keyPoints: string[];
  stats: { label: string; value: string }[];
};

export type PresentationCopy = {
  metaTitle: string;
  metaDescription: string;
  backToApp: string;
  studioBadge: string;
  officialPresentationSuffix: string;
  viewModes: {
    landscapeTitle: string;
    landscapeLabel: string;
    mobileTitle: string;
    mobileLabel: string;
    splitTitle: string;
    splitLabel: string;
  };
  recording: {
    start: string;
    stop: (seconds: number) => string;
    unsupported: string;
    fullscreenTitle: string;
  };
  hud: {
    scene: (number: string, total: string) => string;
    playing: string;
    paused: string;
    zoomActive: (scale: string) => string;
    urlBarLabel: string;
  };
  desktopWindowLabel: string;
  storyboard: {
    keyFeaturesTitle: string;
    metricsTitle: string;
  };
  timeline: {
    prevScene: string;
    nextScene: string;
    restart: string;
    play: string;
    pause: string;
    sceneTitleAttr: (number: string, title: string) => string;
  };
  scenes: Record<string, SceneCopy>;
};

const fr: PresentationCopy = {
  metaTitle: "Présentation Motion Design 16:9 & Mobile, CARZONE SARL Ops",
  metaDescription:
    "Présentation dynamique et motion design du progiciel de concession automobile CARZONE SARL : finances réelles, fiches techniques IA immuables, atelier SAV, VoIP et mobile checking en temps réel.",
  backToApp: "← Retour à l'App",
  studioBadge: "STUDIO MOTION",
  officialPresentationSuffix: "· Présentation Officielle",
  viewModes: {
    landscapeTitle: "Format Ordinateur 16:9 Landscape",
    landscapeLabel: "16:9 Ordinateur",
    mobileTitle: "Format Mobile 9:16 (Checking Nomade)",
    mobileLabel: "Mobile Checking",
    splitTitle: "Vue Duo Synchronisée Ordinateur + Mobile",
    splitLabel: "Vue Duo Miroir",
  },
  recording: {
    start: "Enregistrer Vidéo Motion",
    stop: (seconds) => `Arrêter & Télécharger (${seconds}s)`,
    unsupported: "Enregistrement annulé ou non supporté par ce navigateur.",
    fullscreenTitle: "Plein Écran (Touche F)",
  },
  hud: {
    scene: (number, total) => `SCÈNE ${number} / ${total}`,
    playing: "LECTURE CINÉMATIQUE AUTOMATIQUE",
    paused: "PAUSE",
    zoomActive: (scale) => `ZOOM ACTIF : ×${scale}`,
    urlBarLabel: "16:9 UHD · 60 FPS",
  },
  desktopWindowLabel: "Bureau 16:9",
  storyboard: {
    keyFeaturesTitle: "Fonctionnalités Clés en Production",
    metricsTitle: "Métriques Opérationnelles",
  },
  timeline: {
    prevScene: "Scène précédente",
    nextScene: "Scène suivante",
    restart: "Recommencer depuis le début",
    play: "Lecture",
    pause: "Pause",
    sceneTitleAttr: (number, title) => `${number} - ${title}`,
  },
  scenes: {
    intro: {
      title: "CARZONE Ops, Système d'Exploitation Concessionnaire",
      subtitle: "Architecture d'Entreprise Unifiée & Mobilité Haute Performance",
      badge: "100% Production · BDD Neon",
      description:
        "Plateforme centralisée tout-en-un pour le pilotage complet de la concession Carzone SARL à Cotonou : stocks véhicules, atelier SAV, comptabilité, CRM, VoIP interne et bornes électriques.",
      keyPoints: [
        "Authentification sécurisée par hachage Bcrypt & sessions inviolables",
        "Matrice de permissions granulaires sur 18 rôles opérationnels",
        "Expérience unifiée sur ordinateur grand écran et smartphone",
      ],
      stats: [
        { label: "Rôles Métiers", value: "18 Rôles" },
        { label: "Intégrité BDD", value: "100% Réelle" },
        { label: "Temps Réel", value: "< 250ms" },
      ],
    },
    finance: {
      title: "Tableau de Bord Financier & Graphes Réels",
      subtitle: "Visibilité Totale sur les Ventes, Dépenses et Bénéfices Réels",
      badge: "Zéro Donnée Fictive",
      description:
        "4 graphes dynamiques reliés directement aux écritures comptables réelles : évolution des ventes, évolution des dépenses, performance des activités et bénéfice général net calculé après salaires et charges.",
      keyPoints: [
        "Calcul automatique du bénéfice net après salaires et charges réelles",
        "Filtre temporel instantané : 1 mois, 6 mois, 1 an, 2 ans, 3 ans",
        "Corrélation stricte avec les factures réglées et les bons de caisse",
      ],
      stats: [
        { label: "Graphes Clés", value: "4 Piliers" },
        { label: "Horizons", value: "1M à 3 Ans" },
        { label: "Précision", value: "Comptable" },
      ],
    },
    "tech-sheet": {
      title: "Fiches Techniques IA & Stock Véhicules",
      subtitle: "Génération OpenAI GPT-4o & Enregistrement Définitif en BDD",
      badge: "Immuabilité Base de Données",
      description:
        "Génération assistée par IA avec bouton de confirmation. Une fois la fiche technique validée, elle reste définitivement stockée en BDD, sans aucune régénération redondante, avec une navigation fluide sans ouverture d'autre onglet.",
      keyPoints: [
        "Spécifications complètes : motorisation, puissance, autonomie, dimensions",
        "Bouton « Confirmer la fiche technique » pour gel immuable en BDD",
        "Consultation directe in-app avec retour facile au catalogue",
      ],
      stats: [
        { label: "Modèle IA", value: "GPT-4o" },
        { label: "Persistance", value: "Définitive" },
        { label: "Économie Tokens", value: "> 95%" },
      ],
    },
    workshop: {
      title: "Atelier SAV & Matrice Excel Bidirectionnelle",
      subtitle: "Suivi des Réparations, Ordres de Travail & Import/Export XLSX",
      badge: "Compatibilité Excel Native",
      description:
        "Pilotage des ordres de réparation, pièces détachées et devis techniques, avec export et import instantanés grâce à un modèle Excel structuré pour les équipes terrain et le chef d'atelier.",
      keyPoints: [
        "Téléchargement du modèle de matrice Excel préformaté en 1 clic",
        "Synchronisation bidirectionnelle fluide entre l'atelier et la facturation",
        "Suivi des délais, kilométrages et statuts d'intervention en direct",
      ],
      stats: [
        { label: "Format Fichier", value: ".XLSX" },
        { label: "Temps Synchro", value: "Instantané" },
        { label: "Suivi Pièces", value: "Intégré" },
      ],
    },
    voip: {
      title: "Téléphonie VoIP & Salons de Conférence Audio",
      subtitle: "Communications d'Équipe Chiffrées & Salons Virtuels Dédiés",
      badge: "WebRTC Audio HD",
      description:
        "Messagerie interne instantanée, appels vocaux poste-à-poste et 4 salons de conférence audio virtuels permanents : Direction Générale, Atelier SAV, Commercial et Entreprise.",
      keyPoints: [
        "Communication audio chiffrée de bout en bout, sans standard téléphonique externe",
        "Visualiseur audio animé et gestion des micros en temps réel",
        "Canaux d'annonces officielles et diffusion de consignes urgentes",
      ],
      stats: [
        { label: "Salons Permanents", value: "4 Espaces" },
        { label: "Latence Audio", value: "< 50ms" },
        { label: "Confidentialité", value: "Chiffré" },
      ],
    },
    mobile: {
      title: "Mobile Checking & Notifications en Temps Réel",
      subtitle: "Supervision Nomade pour la Direction et les Équipes Terrain",
      badge: "Ultra-Responsive Mobile",
      description:
        "Interface mobile conçue pour le contrôle à la volée : consultation des notifications d'urgence, validation de devis, vérification des entrées/sorties de véhicules et navigation au pouce optimisée.",
      keyPoints: [
        "Cloche de notifications temps réel avec alertes sonores et visuelles",
        "Tiroir de navigation rapide adapté aux manipulations à une main",
        "Vitesse de chargement fulgurante optimisée pour les réseaux 4G/5G",
      ],
      stats: [
        { label: "Viewport", value: "390 × 844" },
        { label: "Touch UX", value: "100% Fluide" },
        { label: "Alertes", value: "Push Réel" },
      ],
    },
    help: {
      title: "Centre d'Aide & Documentation Stylée",
      subtitle: "Guides Intégrés, Recherche Instantanée & Premiers Pas Mémorisés",
      badge: "Design Glassmorphism",
      description:
        "Modal d'aide moderne accessible depuis le header et le menu mobile. Le guide « Premiers pas » est mémorisé par utilisateur pour ne plus encombrer l'écran une fois fermé, avec une relance possible à la demande.",
      keyPoints: [
        "Recherche instantanée filtrant tous les modules et procédures",
        "Guides thématiques complets pour chaque corps de métier",
        "Nettoyage complet de l'interface : aucun bouton flottant persistant",
      ],
      stats: [
        { label: "Guides Métiers", value: "8 Modules" },
        { label: "Filtre Recherche", value: "Instant" },
        { label: "UX Clutter", value: "0% Déchet" },
      ],
    },
    security: {
      title: "Sécurité d'Entreprise, Rôles & Scalabilité",
      subtitle: "Une Infrastructure Pérenne Prête pour l'Expansion Nationale",
      badge: "Conforme Normes Bancaires",
      description:
        "Base de données relationnelle Neon PostgreSQL avec pool de connexions haute disponibilité, mots de passe chiffrés Bcrypt avec temporisation anti-bruteforce progressive, et isolation stricte du rôle DEVELOPER.",
      keyPoints: [
        "Protection multi-niveaux contre les attaques par force brute (verrou progressif)",
        "Journalisation d'audit des actions critiques et des transactions",
        "Hébergement cloud Vercel avec bascule instantanée et sauvegardes continues",
      ],
      stats: [
        { label: "Chiffrement", value: "Bcrypt Cost 10" },
        { label: "Uptime Cloud", value: "99.98%" },
        { label: "Audit Log", value: "100% Traçable" },
      ],
    },
  },
};

const en: PresentationCopy = {
  metaTitle: "16:9 & Mobile Motion Design Presentation, CARZONE SARL Ops",
  metaDescription:
    "A dynamic motion design presentation of the CARZONE SARL dealership software: real finances, immutable AI spec sheets, the service workshop, VoIP and real-time mobile checking.",
  backToApp: "← Back to the App",
  studioBadge: "MOTION STUDIO",
  officialPresentationSuffix: "· Official Presentation",
  viewModes: {
    landscapeTitle: "16:9 Landscape Desktop Format",
    landscapeLabel: "16:9 Desktop",
    mobileTitle: "9:16 Mobile Format (On-the-Go Checking)",
    mobileLabel: "Mobile Checking",
    splitTitle: "Synchronized Dual View, Desktop + Mobile",
    splitLabel: "Mirrored Dual View",
  },
  recording: {
    start: "Record Motion Video",
    stop: (seconds) => `Stop & Download (${seconds}s)`,
    unsupported: "Recording was cancelled or isn't supported by this browser.",
    fullscreenTitle: "Fullscreen (Press F)",
  },
  hud: {
    scene: (number, total) => `SCENE ${number} / ${total}`,
    playing: "AUTOMATIC CINEMATIC PLAYBACK",
    paused: "PAUSED",
    zoomActive: (scale) => `ZOOM LEVEL: ×${scale}`,
    urlBarLabel: "16:9 UHD · 60 FPS",
  },
  desktopWindowLabel: "16:9 Desktop",
  storyboard: {
    keyFeaturesTitle: "Key Features in Production",
    metricsTitle: "Operational Metrics",
  },
  timeline: {
    prevScene: "Previous scene",
    nextScene: "Next scene",
    restart: "Restart from the beginning",
    play: "Play",
    pause: "Pause",
    sceneTitleAttr: (number, title) => `${number} - ${title}`,
  },
  scenes: {
    intro: {
      title: "CARZONE Ops, the Dealership Operating System",
      subtitle: "A Unified Enterprise Architecture & High-Performance Mobility",
      badge: "100% Production · Neon Database",
      description:
        "An all-in-one centralized platform to run the entire Carzone SARL dealership in Cotonou: vehicle stock, service workshop, accounting, CRM, internal VoIP and EV charging stations.",
      keyPoints: [
        "Secure authentication with Bcrypt hashing and tamper-proof sessions",
        "Granular permission matrix across 18 operational roles",
        "A unified experience on both desktop and smartphone",
      ],
      stats: [
        { label: "Business Roles", value: "18 Roles" },
        { label: "Data Integrity", value: "100% Real" },
        { label: "Real Time", value: "< 250ms" },
      ],
    },
    finance: {
      title: "Financial Dashboard & Real Charts",
      subtitle: "Full Visibility Into Real Sales, Expenses and Profit",
      badge: "Zero Fake Data",
      description:
        "4 dynamic charts wired directly to real accounting entries: sales trends, expense trends, activity performance, and overall net profit calculated after wages and overhead.",
      keyPoints: [
        "Automatic net profit calculation after real wages and overhead",
        "Instant time filter: 1 month, 6 months, 1 year, 2 years, 3 years",
        "Strictly matched against settled invoices and cash vouchers",
      ],
      stats: [
        { label: "Key Charts", value: "4 Pillars" },
        { label: "Time Range", value: "1M to 3Y" },
        { label: "Accuracy", value: "Accounting-Grade" },
      ],
    },
    "tech-sheet": {
      title: "AI Spec Sheets & Vehicle Stock",
      subtitle: "Generated with OpenAI GPT-4o, Permanently Saved to the Database",
      badge: "Database Immutability",
      description:
        "AI-assisted generation with a confirmation button. Once a spec sheet is validated, it stays permanently stored in the database with no redundant regeneration, and browsing stays smooth with no extra tabs to open.",
      keyPoints: [
        "Full specifications: engine, power, range, dimensions",
        "A \"Confirm spec sheet\" button locks the record permanently",
        "Direct in-app viewing with an easy way back to the catalog",
      ],
      stats: [
        { label: "AI Model", value: "GPT-4o" },
        { label: "Persistence", value: "Permanent" },
        { label: "Token Savings", value: "> 95%" },
      ],
    },
    workshop: {
      title: "Service Workshop & Two-Way Excel Matrix",
      subtitle: "Repair Tracking, Work Orders & XLSX Import/Export",
      badge: "Native Excel Compatibility",
      description:
        "Manage repair orders, spare parts and technical quotes, with instant export and import through a structured Excel template built for field teams and the shop foreman.",
      keyPoints: [
        "Download the pre-formatted Excel matrix template in 1 click",
        "Smooth two-way sync between the workshop and billing",
        "Live tracking of lead times, mileage and job statuses",
      ],
      stats: [
        { label: "File Format", value: ".XLSX" },
        { label: "Sync Time", value: "Instant" },
        { label: "Parts Tracking", value: "Built-In" },
      ],
    },
    voip: {
      title: "VoIP Telephony & Audio Conference Rooms",
      subtitle: "Encrypted Team Communication & Dedicated Virtual Rooms",
      badge: "HD WebRTC Audio",
      description:
        "Instant internal messaging, peer-to-peer voice calls and 4 permanent virtual audio conference rooms: Management, Service Workshop, Sales and Company-wide.",
      keyPoints: [
        "End-to-end encrypted audio, no external phone system required",
        "Animated audio visualizer with real-time microphone management",
        "Official announcement channels for broadcasting urgent instructions",
      ],
      stats: [
        { label: "Permanent Rooms", value: "4 Spaces" },
        { label: "Audio Latency", value: "< 50ms" },
        { label: "Privacy", value: "Encrypted" },
      ],
    },
    mobile: {
      title: "Mobile Checking & Real-Time Notifications",
      subtitle: "On-the-Go Oversight for Management and Field Teams",
      badge: "Ultra-Responsive Mobile",
      description:
        "A mobile interface built for quick checks on the move: urgent notifications, quote approvals, vehicle check-in/check-out verification and thumb-friendly navigation.",
      keyPoints: [
        "Real-time notification bell with sound and visual alerts",
        "Quick navigation drawer built for one-handed use",
        "Lightning-fast loading, tuned for 4G/5G networks",
      ],
      stats: [
        { label: "Viewport", value: "390 × 844" },
        { label: "Touch UX", value: "100% Smooth" },
        { label: "Alerts", value: "Real Push" },
      ],
    },
    help: {
      title: "Help Center & Styled Documentation",
      subtitle: "Built-In Guides, Instant Search & Remembered First Steps",
      badge: "Glassmorphism Design",
      description:
        "A modern help modal reachable from the header and the mobile menu. The \"Getting started\" guide is remembered per user, so it stops cluttering the screen once closed, with an easy way to bring it back on demand.",
      keyPoints: [
        "Instant search across every module and procedure",
        "Full topic-based guides for each job function",
        "A fully decluttered interface, with no persistent floating buttons",
      ],
      stats: [
        { label: "Job Guides", value: "8 Modules" },
        { label: "Search Filter", value: "Instant" },
        { label: "UX Clutter", value: "0% Waste" },
      ],
    },
    security: {
      title: "Enterprise Security, Roles & Scalability",
      subtitle: "A Lasting Infrastructure Ready for Nationwide Expansion",
      badge: "Banking-Grade Compliance",
      description:
        "A Neon PostgreSQL relational database with a high-availability connection pool, Bcrypt-encrypted passwords with progressive anti-brute-force throttling, and strict isolation of the DEVELOPER role.",
      keyPoints: [
        "Multi-layer protection against brute-force attacks (progressive lockout)",
        "Audit logging of critical actions and transactions",
        "Vercel cloud hosting with instant failover and continuous backups",
      ],
      stats: [
        { label: "Encryption", value: "Bcrypt Cost 10" },
        { label: "Cloud Uptime", value: "99.98%" },
        { label: "Audit Log", value: "100% Traceable" },
      ],
    },
  },
};

const zh: PresentationCopy = {
  metaTitle: "16:9 与移动端动态演示,CARZONE SARL Ops",
  metaDescription:
    "CARZONE SARL 经销商管理系统的动态演示:真实财务数据、不可篡改的AI配置单、售后车间、VoIP通讯及实时移动端巡查。",
  backToApp: "← 返回应用",
  studioBadge: "动态演示工作室",
  officialPresentationSuffix: "· 官方演示",
  viewModes: {
    landscapeTitle: "16:9 横屏电脑格式",
    landscapeLabel: "16:9 电脑视图",
    mobileTitle: "9:16 移动端格式(随身巡查)",
    mobileLabel: "移动端巡查",
    splitTitle: "电脑 + 移动端同步双屏视图",
    splitLabel: "双屏镜像视图",
  },
  recording: {
    start: "录制动态演示视频",
    stop: (seconds) => `停止并下载(${seconds}秒)`,
    unsupported: "录制已取消,或当前浏览器不支持此功能。",
    fullscreenTitle: "全屏显示(按 F 键)",
  },
  hud: {
    scene: (number, total) => `场景 ${number} / ${total}`,
    playing: "自动电影式播放中",
    paused: "已暂停",
    zoomActive: (scale) => `当前缩放:×${scale}`,
    urlBarLabel: "16:9 UHD · 60 FPS",
  },
  desktopWindowLabel: "16:9 电脑端",
  storyboard: {
    keyFeaturesTitle: "已上线的核心功能",
    metricsTitle: "运营关键指标",
  },
  timeline: {
    prevScene: "上一个场景",
    nextScene: "下一个场景",
    restart: "从头开始播放",
    play: "播放",
    pause: "暂停",
    sceneTitleAttr: (number, title) => `${number} - ${title}`,
  },
  scenes: {
    intro: {
      title: "CARZONE Ops,经销商运营系统",
      subtitle: "统一的企业架构与高性能移动体验",
      badge: "100% 生产环境 · Neon 数据库",
      description:
        "一体化集中平台,全面管理科托努 Carzone SARL 经销商的车辆库存、售后车间、财务、客户关系、内部语音通讯及充电桩业务。",
      keyPoints: [
        "基于 Bcrypt 哈希加密的安全认证与不可篡改的会话机制",
        "覆盖18个业务角色的细粒度权限矩阵",
        "电脑大屏与手机端体验完全统一",
      ],
      stats: [
        { label: "业务角色", value: "18个角色" },
        { label: "数据真实性", value: "100%真实" },
        { label: "实时响应", value: "< 250毫秒" },
      ],
    },
    finance: {
      title: "财务看板与真实图表",
      subtitle: "销售、支出与利润数据全面可视化",
      badge: "零虚构数据",
      description:
        "4个动态图表直接连接真实会计记录:销售趋势、支出趋势、业务表现,以及扣除工资与运营成本后计算出的净利润。",
      keyPoints: [
        "基于真实工资与运营成本自动计算净利润",
        "即时时间筛选:1个月、6个月、1年、2年、3年",
        "与已结算发票及现金单严格对应",
      ],
      stats: [
        { label: "核心图表", value: "4大支柱" },
        { label: "时间跨度", value: "1个月至3年" },
        { label: "精确度", value: "财务级" },
      ],
    },
    "tech-sheet": {
      title: "AI配置单与车辆库存",
      subtitle: "由 OpenAI GPT-4o 生成,永久保存至数据库",
      badge: "数据库不可篡改",
      description:
        "AI辅助生成,配有确认按钮。配置单一经确认即永久保存至数据库,不再重复生成,查看流畅无需额外打开标签页。",
      keyPoints: [
        "完整技术参数:动力系统、功率、续航、尺寸",
        "“确认配置单”按钮一键永久锁定数据",
        "应用内直接查看,轻松返回产品目录",
      ],
      stats: [
        { label: "AI 模型", value: "GPT-4o" },
        { label: "数据持久性", value: "永久保存" },
        { label: "Token 节省", value: "> 95%" },
      ],
    },
    workshop: {
      title: "售后车间与双向 Excel 矩阵",
      subtitle: "维修跟踪、工单管理与 XLSX 导入导出",
      badge: "原生兼容 Excel",
      description:
        "管理维修工单、零配件与技术报价,通过结构化 Excel 模板实现即时导出导入,专为一线团队与车间主管设计。",
      keyPoints: [
        "一键下载预设格式的 Excel 矩阵模板",
        "车间与开票系统之间顺畅的双向同步",
        "实时跟踪维修周期、里程数及工单状态",
      ],
      stats: [
        { label: "文件格式", value: ".XLSX" },
        { label: "同步速度", value: "即时" },
        { label: "配件跟踪", value: "已集成" },
      ],
    },
    voip: {
      title: "VoIP 电话与语音会议室",
      subtitle: "加密团队通讯与专属虚拟会议室",
      badge: "高清 WebRTC 语音",
      description:
        "即时内部通讯、点对点语音通话,以及4个常驻虚拟语音会议室:总经理办公室、售后车间、销售部与全公司频道。",
      keyPoints: [
        "端到端加密语音通话,无需外部电话系统",
        "动态语音可视化及实时麦克风管理",
        "官方公告频道,用于发布紧急通知",
      ],
      stats: [
        { label: "常驻会议室", value: "4个空间" },
        { label: "语音延迟", value: "< 50毫秒" },
        { label: "隐私保护", value: "已加密" },
      ],
    },
    mobile: {
      title: "移动端巡查与实时通知",
      subtitle: "为管理层与一线团队提供随身监督能力",
      badge: "超流畅移动端",
      description:
        "专为移动随查设计的界面:紧急通知查看、报价审批、车辆出入核实,以及优化过的单手拇指操作导航。",
      keyPoints: [
        "实时通知提醒,配有声音与视觉提示",
        "适合单手操作的快速导航菜单",
        "针对4G/5G网络优化的极速加载速度",
      ],
      stats: [
        { label: "视口尺寸", value: "390 × 844" },
        { label: "触控体验", value: "100%流畅" },
        { label: "推送提醒", value: "真实推送" },
      ],
    },
    help: {
      title: "帮助中心与精美文档",
      subtitle: "内置指南、即时搜索与记忆入门引导",
      badge: "玻璃拟态设计",
      description:
        "现代化帮助弹窗,可从顶部栏及移动端菜单打开。“新手入门”指南按用户记忆状态,关闭后不再占用屏幕,需要时仍可随时重新打开。",
      keyPoints: [
        "即时搜索,覆盖所有模块与操作流程",
        "按岗位分类的完整主题指南",
        "界面彻底精简,没有常驻悬浮按钮",
      ],
      stats: [
        { label: "岗位指南", value: "8个模块" },
        { label: "搜索筛选", value: "即时响应" },
        { label: "界面冗余", value: "0%冗余" },
      ],
    },
    security: {
      title: "企业级安全、权限与可扩展性",
      subtitle: "面向全国扩张的稳固基础架构",
      badge: "符合银行级标准",
      description:
        "基于 Neon PostgreSQL 的关系型数据库,配备高可用连接池,密码采用 Bcrypt 加密并设有渐进式防暴力破解延迟机制,且严格隔离 DEVELOPER 角色权限。",
      keyPoints: [
        "多层级防暴力破解保护(渐进式锁定机制)",
        "关键操作与交易的审计日志记录",
        "Vercel 云端托管,支持即时故障切换与持续备份",
      ],
      stats: [
        { label: "加密方式", value: "Bcrypt Cost 10" },
        { label: "云端可用率", value: "99.98%" },
        { label: "审计日志", value: "100%可追溯" },
      ],
    },
  },
};

export const presentationCopy: Record<Locale, PresentationCopy> = { fr, en, zh };
