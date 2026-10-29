import type { Locale } from "@/lib/prefs";

export type HelpCenterSectionCopy = {
  heading: string;
  content: string;
  tips?: string[];
};

export type HelpCenterTopicCopy = {
  title: string;
  badge: string;
  summary: string;
  linkText?: string;
  sections: HelpCenterSectionCopy[];
};

export type HelpCenterCopy = {
  header: {
    title: string;
    versionBadge: string;
    subtitle: string;
    relaunchCta: string;
    relaunchTitle: string;
    closeTitle: string;
  };
  search: {
    placeholder: string;
    clear: string;
  };
  sidebar: {
    heading: string;
  };
  reader: {
    fallbackLinkText: string;
    noResults: string;
  };
  topics: {
    gettingStarted: HelpCenterTopicCopy;
    dashboard: HelpCenterTopicCopy;
    vehicles: HelpCenterTopicCopy;
    workshop: HelpCenterTopicCopy;
    invoicesExpenses: HelpCenterTopicCopy;
    voipChat: HelpCenterTopicCopy;
    charging: HelpCenterTopicCopy;
    security: HelpCenterTopicCopy;
  };
};

const fr: HelpCenterCopy = {
  header: {
    title: "Centre d'aide et documentation CARZONE Ops",
    versionBadge: "Version officielle 2026",
    subtitle:
      "Guides détaillés, règles de gestion et procédures d'exploitation pour l'équipe CARZONE SARL.",
    relaunchCta: "Relancer Premiers Pas",
    relaunchTitle: "Réouvrir la checklist guidée de prise en main, adaptée à votre rôle",
    closeTitle: "Fermer (Échap)",
  },
  search: {
    placeholder:
      "Rechercher une procédure ou un module (dashboard, fiches IA, atelier Excel, facturation, VoIP...)",
    clear: "Effacer",
  },
  sidebar: {
    heading: "Rubriques & Modules",
  },
  reader: {
    fallbackLinkText: "Accéder au module",
    noResults: "Rien ne correspond à votre recherche.",
  },
  topics: {
    gettingStarted: {
      title: "1. Premiers pas et prise en main",
      badge: "Démarrage",
      summary:
        "Un tour d'ensemble de CARZONE Ops : navigation par rôle et principes de base.",
      sections: [
        {
          heading: "Comment la plateforme est organisée",
          content:
            "CARZONE Ops est l'ERP maison de CARZONE SARL Bénin. Il réunit au même endroit le showroom de véhicules neufs, l'Atelier SAV, la facturation normalisée, la trésorerie réelle et les échanges d'équipe.",
          tips: [
            "Chaque collaborateur voit une interface calibrée sur son rôle métier.",
            "Tout ce qui s'affiche vient de la base PostgreSQL. Aucune donnée n'est recopiée à la main.",
          ],
        },
        {
          heading: "Se déplacer dans l'application",
          content:
            "La barre latérale gauche donne accès à tous les modules. Sur mobile, le menu s'ouvre depuis l'icône de navigation. La barre du haut garde sous la main les messages et les appels, les alertes de sécurité réservées à la Direction, les préférences de thème et ce Centre d'Aide.",
        },
      ],
    },
    dashboard: {
      title: "2. Tableau de bord financier et performance",
      badge: "Finance & DG",
      summary:
        "Rentabilité réelle, trésorerie consolidée et période ajustable en un clic.",
      linkText: "Ouvrir le Tableau de Bord",
      sections: [
        {
          heading: "Les quatre graphiques de performance réelle",
          content:
            "Aucune courbe n'est simulée. Tout est calculé mois par mois à partir des écritures réelles.",
          tips: [
            "💎 1. Bénéfice général réel : la marge brute des ventes encaissées, moins toutes les dépenses de l'entreprise (charges, prestataires, loyers) et moins les salaires versés chaque mois.",
            "💰 2. Évolution des ventes : le montant facturé (proformas et ventes) face au montant réellement encaissé.",
            "💸 3. Dépenses d'entreprise : tous les décaissements réels, bons de commande BC compris, plus les charges d'exploitation, les fournisseurs et la paie.",
            "⚡ 4. Activités et opérations : les volumes réels d'entrées et de sorties à l'Atelier SAV, les devis émis et les fiches véhicules actives.",
          ],
        },
        {
          heading: "Changer la période",
          content:
            "Le sélecteur en haut à droite propose 1 mois, 6 mois, 1 an, 2 ans ou 3 ans. Totaux, pourcentages et moyennes mensuelles suivent immédiatement.",
        },
      ],
    },
    vehicles: {
      title: "3. Véhicules, fiches techniques et stock",
      badge: "Showroom",
      summary:
        "Parc automobile, fiches techniques homologuées, génération IA véhicule par véhicule et impression officielle.",
      linkText: "Gérer le Stock Véhicules",
      sections: [
        {
          heading: "Fiches techniques et confirmation en base",
          content:
            "Chaque véhicule possède sa fiche complète : motorisation, batterie, autonomie CLTC/WLTP, dimensions, sécurité et équipements.",
          tips: [
            "Génération OpenAI véhicule par véhicule : l'IA ne démarre que si vous la demandez pour une fiche précise. Les autres fiches ne coûtent rien.",
            "Le bouton vert « Confirmer la fiche technique » scelle la fiche en base PostgreSQL. Une fois écrite, elle fait foi : le système relit toujours la base.",
            "La fiche s'ouvre dans la même fenêtre, ce qui permet de la consulter puis de revenir en arrière sans perdre sa place.",
          ],
        },
        {
          heading: "Impression et devis clients",
          content:
            "Le bouton « Imprimer la Fiche Technique » sort un document officiel de prestige. Le texte n'est ni coupé ni débordant, et le document peut partir chez l'acheteur ou rejoindre une facture proforma.",
        },
      ],
    },
    workshop: {
      title: "4. Atelier SAV, réparations et matrice Excel",
      badge: "Atelier Garage",
      summary:
        "Ordres de réparation, diagnostics et fichier Excel officiel Carzone.",
      linkText: "Consulter l'Atelier SAV",
      sections: [
        {
          heading: "Le parcours d'un ordre de réparation (OR)",
          content:
            "Un véhicule arrive à l'atelier. Créez l'OR avec l'immatriculation, le kilométrage et le motif, puis attribuez un technicien. Viennent ensuite le diagnostic technique et le devis des pièces. Il reste à valider les travaux et à enregistrer la sortie.",
        },
        {
          heading: "Matrice Excel SAV Carzone",
          content: "L'atelier travaille aussi sous Excel :",
          tips: [
            "« Télécharger Modèle Excel » donne la grille officielle, avec les colonnes homologuées.",
            "« Exporter l'historique en Excel » sort tous les passages d'atelier dans un fichier .XLSX, prêt pour la comptabilité ou la Direction.",
          ],
        },
      ],
    },
    invoicesExpenses: {
      title: "5. Ventes, facturation, dépenses et salaires",
      badge: "Comptabilité",
      summary:
        "Devis, factures normalisées, encaissements et charges de fonctionnement.",
      linkText: "Gérer la Facturation",
      sections: [
        {
          heading: "Factures et règlements clients",
          content:
            "Émettez une proforma, puis convertissez-la en facture de vente. Quand un paiement arrive, le bouton « Encaisser » demande le mode (Virement, Chèque, Espèces, Mobile Money) et la référence.",
          tips: [
            "Les statuts avancent seuls : BROUILLON, EN_ATTENTE, PAYEE_PARTIEL, PAYEE.",
            "« Extraction Bilan Financier » télécharge le grand livre complet.",
          ],
        },
        {
          heading: "Dépenses et bons de commande (BC)",
          content:
            "La section Dépenses (/expenses) enregistre les achats chez les prestataires et les fournisseurs, plus les loyers, avec un bon de commande automatique (par exemple BC-2026-001). Les salaires versés dans le module RH (/hr) entrent aussi dans le consolidé.",
        },
      ],
    },
    voipChat: {
      title: "6. Téléphonie VoIP, conférences et chat",
      badge: "Communication",
      summary: "Appels internes, salons audio et messagerie d'équipe.",
      linkText: "Accéder à la Messagerie & Appels",
      sections: [
        {
          heading: "Appeler un collègue",
          content:
            "Depuis le module Chat (/chat) ou l'annuaire d'équipe, cliquez sur le téléphone vert à côté du nom. L'appel passe en WebRTC chiffré, entre votre navigateur et celui du collègue.",
        },
        {
          heading: "Salons de conférence audio",
          content:
            "Trois salons permanents vous attendent : Comité de Direction, Atelier SAV et Réunion Commerciale. Vous pouvez couper votre micro, suivre en direct qui parle et inviter quelqu'un en un clic.",
          tips: [
            "Autorisez le micro dans votre navigateur, sinon votre voix ne passe pas.",
            "Seul l'organisateur du salon, ou la Direction, peut le clôturer.",
          ],
        },
      ],
    },
    charging: {
      title: "7. Bornes de recharge et terminal express",
      badge: "Énergie",
      summary:
        "Bornes rapides à Cotonou, tarif Club VIP et terminal d'encaissement.",
      linkText: "Voir les Bornes de Recharge",
      sections: [
        {
          heading: "Tarifs et abonnements",
          content:
            "CARZONE SARL exploite un réseau de bornes ultra-rapides. L'accès public est à 125 FCFA / kWh. Les abonnés au Club CARZONE VIP paient 90 FCFA / kWh.",
        },
        {
          heading: "Terminal express au comptoir (/terminal)",
          content:
            "L'hôtesse ou le caissier y saisit une session de recharge manuelle. Le montant en FCFA se calcule seul et la facture de recharge se génère dans la foulée.",
        },
      ],
    },
    security: {
      title: "8. Sécurité, profils et Bcrypt",
      badge: "Sécurité & Audit",
      summary: "Mots de passe hachés, rôles cloisonnés et accès contrôlés.",
      linkText: "Gérer les Utilisateurs",
      sections: [
        {
          heading: "Les identifiants, protégés",
          content:
            "Aucun mot de passe n'est stocké en clair. Tous passent par Bcrypt, un hachage irréversible.",
          tips: [
            "Le DG et l'Administrateur peuvent définir ou réinitialiser un mot de passe depuis la vue Utilisateurs (/users).",
            "Une session inactive expire et se voit invalidée. Un collaborateur désactivé perd l'accès tout de suite.",
          ],
        },
        {
          heading: "Rôles et permissions",
          content:
            "Chaque compte porte ses permissions (DG, ADV, RF, Commercial, Chef d'Atelier, RH, etc.). Les données confidentielles restent cloisonnées.",
        },
      ],
    },
  },
};

const en: HelpCenterCopy = {
  header: {
    title: "CARZONE Ops Help Center & Documentation",
    versionBadge: "Official 2026 Release",
    subtitle:
      "Detailed guides, business rules and operating procedures for the CARZONE SARL team.",
    relaunchCta: "Restart Getting Started",
    relaunchTitle: "Reopen the guided setup checklist matched to your role",
    closeTitle: "Close (Esc)",
  },
  search: {
    placeholder:
      "Search a procedure or a module (dashboard, AI spec sheets, workshop Excel, invoicing, VoIP...)",
    clear: "Clear",
  },
  sidebar: {
    heading: "Sections & Modules",
  },
  reader: {
    fallbackLinkText: "Open the module",
    noResults: "Nothing matches your search.",
  },
  topics: {
    gettingStarted: {
      title: "1. Getting Started & Setup",
      badge: "Getting Started",
      summary:
        "A full walkthrough of CARZONE Ops, with role-based navigation and the ground rules.",
      sections: [
        {
          heading: "How the platform is organized",
          content:
            "CARZONE Ops is the in-house ERP for CARZONE SARL Benin. It brings the new-vehicle showroom, the Service workshop, standardized invoicing, real cash flow and team messaging under one roof.",
          tips: [
            "Every staff member gets a view built around their own role.",
            "Everything on screen comes straight from the PostgreSQL database. Nothing is re-keyed by hand.",
          ],
        },
        {
          heading: "Getting around the app",
          content:
            "The left sidebar reaches every module. On mobile, tap the navigation icon to open the menu. The top bar keeps messages and calls, the security alerts reserved for Management, the theme preferences and this Help Center within reach.",
        },
      ],
    },
    dashboard: {
      title: "2. Financial Dashboard & Performance",
      badge: "Finance & Management",
      summary:
        "Real profitability, consolidated cash flow and a period you can change in one click.",
      linkText: "Open the Dashboard",
      sections: [
        {
          heading: "The four real-performance charts",
          content:
            "No chart here is simulated. Each one is calculated month by month from actual ledger entries.",
          tips: [
            "💎 1. Actual overall profit: gross margin on collected sales, minus every company expense (operating costs, contractors, rent) and minus the payroll paid each month.",
            "💰 2. Sales trend: the amount invoiced (proformas and sales) next to the amount actually collected.",
            "💸 3. Company expenses: every real outgoing payment, purchase orders (BC) included, plus operating costs, suppliers and payroll.",
            "⚡ 4. Activity and operations: real volumes of workshop check-ins and check-outs, quotes issued and active vehicle files.",
          ],
        },
        {
          heading: "Changing the period",
          content:
            "The selector at the top right offers 1 month, 6 months, 1 year, 2 years or 3 years. Totals, percentages and monthly averages follow right away.",
        },
      ],
    },
    vehicles: {
      title: "3. Vehicles, Spec Sheets & Stock",
      badge: "Showroom",
      summary:
        "The vehicle park, approved spec sheets, AI generation one vehicle at a time and official printing.",
      linkText: "Manage Vehicle Stock",
      sections: [
        {
          heading: "Spec sheets and database confirmation",
          content:
            "Every vehicle carries a complete spec sheet: engine, battery, CLTC/WLTP range, dimensions, safety and equipment.",
          tips: [
            "OpenAI runs per vehicle. The AI only starts when you explicitly ask for one specific sheet, so the others cost nothing.",
            "The green « Confirmer la fiche technique » button (Confirm spec sheet) seals the sheet in the PostgreSQL database. Once written, the database is the reference the system reads first.",
            "The sheet opens in the same window, so you can read it and go back without losing your place.",
          ],
        },
        {
          heading: "Printing and customer quotes",
          content:
            "The « Imprimer la Fiche Technique » button (Print spec sheet) produces an official prestige document. No text is cut off or overflowing, and it is ready to hand to a buyer or to attach to a proforma invoice.",
        },
      ],
    },
    workshop: {
      title: "4. Service Workshop, Repairs & Excel Matrix",
      badge: "Workshop",
      summary:
        "Repair orders, diagnostics and the official Carzone Excel file.",
      linkText: "Open the Service Workshop",
      sections: [
        {
          heading: "The life of a repair order (OR)",
          content:
            "A vehicle arrives at the workshop. Create the OR with the plate number, mileage and reason, then assign a technician. Next come the technical diagnosis and the parts quote. All that is left is to approve the work and record the check-out.",
        },
        {
          heading: "Carzone workshop Excel matrix",
          content: "The workshop also works in Excel:",
          tips: [
            "« Télécharger Modèle Excel » (Download Excel template) gives you the official grid with the approved columns.",
            "« Exporter l'historique en Excel » (Export history to Excel) sends every workshop visit to an .XLSX file, ready for Accounting or Management.",
          ],
        },
      ],
    },
    invoicesExpenses: {
      title: "5. Sales, Invoicing, Expenses & Payroll",
      badge: "Accounting",
      summary:
        "Quotes, standardized invoices, payment entry and running costs.",
      linkText: "Manage Invoicing",
      sections: [
        {
          heading: "Invoices and customer payments",
          content:
            "Issue a proforma, then convert it into a sales invoice. When a payment comes in, the « Encaisser » button (Record payment) asks for the method (transfer, cheque, cash, mobile money) and the reference.",
          tips: [
            "Statuses move on their own: BROUILLON, EN_ATTENTE, PAYEE_PARTIEL, PAYEE.",
            "« Extraction Bilan Financier » (Financial statement export) downloads the full ledger.",
          ],
        },
        {
          heading: "Company expenses and purchase orders (BC)",
          content:
            "The Expenses section (/expenses) records purchases from contractors and suppliers, plus rent, each with an automatic purchase order (for example BC-2026-001). Payroll paid in the HR module (/hr) is consolidated too.",
        },
      ],
    },
    voipChat: {
      title: "6. VoIP Calling, Conferences & Chat",
      badge: "Communication",
      summary: "Internal calls, audio rooms and team messaging.",
      linkText: "Open Messaging & Calls",
      sections: [
        {
          heading: "Calling a colleague",
          content:
            "From the Chat module (/chat) or the team directory, click the green phone next to a name. The call runs over encrypted WebRTC, between your browser and theirs.",
        },
        {
          heading: "Audio conference rooms",
          content:
            "Three permanent rooms are open: Management Committee, Service Workshop and Sales Meeting. You can mute your mic, see live who is speaking and invite someone in one click.",
          tips: [
            "Allow microphone access in your browser, otherwise nobody hears you.",
            "Only the room organizer, or Management, can close the room.",
          ],
        },
      ],
    },
    charging: {
      title: "7. Charging Stations & Express Terminal",
      badge: "Energy",
      summary:
        "Fast chargers in Cotonou, VIP Club pricing and a counter payment terminal.",
      linkText: "View the Charging Stations",
      sections: [
        {
          heading: "Pricing and subscriptions",
          content:
            "CARZONE SARL runs a network of ultra-fast chargers. Public access is 125 FCFA / kWh. Club CARZONE VIP members pay 90 FCFA / kWh.",
        },
        {
          heading: "Express terminal at the counter (/terminal)",
          content:
            "The host or cashier enters a manual charging session there. The amount in FCFA is calculated automatically and the matching charging invoice is generated right after.",
        },
      ],
    },
    security: {
      title: "8. Security, User Profiles & Bcrypt",
      badge: "Security & Audit",
      summary: "Hashed passwords, separated roles and controlled access.",
      linkText: "Manage Users",
      sections: [
        {
          heading: "Credentials, kept safe",
          content:
            "No password is stored in plain text. Every one of them goes through Bcrypt, an irreversible hash.",
          tips: [
            "The Managing Director and the Administrator can set or reset a colleague's password from the Users view (/users).",
            "An idle session expires and gets invalidated. A deactivated colleague loses access straight away.",
          ],
        },
        {
          heading: "Roles and permissions",
          content:
            "Every account carries its own permissions (MD, ADV, RF, Sales, Workshop Manager, HR, etc.). Confidential company data stays separated.",
        },
      ],
    },
  },
};

const zh: HelpCenterCopy = {
  header: {
    title: "CARZONE Ops 帮助中心与文档",
    versionBadge: "2026 正式版",
    subtitle: "为 CARZONE SARL 团队准备的详细指南、管理规则与操作流程。",
    relaunchCta: "重新开始入门指引",
    relaunchTitle: "重新打开与您角色对应的入门清单",
    closeTitle: "关闭（Esc）",
  },
  search: {
    placeholder: "搜索流程或模块（dashboard、AI 配置单、车间 Excel、开票、VoIP...）",
    clear: "清空",
  },
  sidebar: {
    heading: "栏目与模块",
  },
  reader: {
    fallbackLinkText: "进入该模块",
    noResults: "没有与您搜索匹配的内容。",
  },
  topics: {
    gettingStarted: {
      title: "1. 入门与上手",
      badge: "入门",
      summary: "认识 CARZONE Ops 的整体界面：按角色导航，以及几条基本原则。",
      sections: [
        {
          heading: "平台是怎么组织的",
          content:
            "CARZONE Ops 是 CARZONE SARL 贝宁自用的 ERP。新车展厅、售后车间、规范开票、真实现金流和团队沟通，都放在同一个系统里。",
          tips: [
            "每位同事看到的界面，都按自己的岗位来调整。",
            "屏幕上显示的数据全部来自 PostgreSQL 数据库，没有手工另存的一份。",
          ],
        },
        {
          heading: "在系统里移动",
          content:
            "左侧边栏通往各个模块。手机上点一下导航图标就能展开菜单。顶部栏放着消息与通话、只对管理层开放的安全提醒、主题偏好，以及这个帮助中心。",
        },
      ],
    },
    dashboard: {
      title: "2. 财务仪表盘与业绩",
      badge: "财务与管理层",
      summary: "真实盈利、合并现金流，时间区间一键切换。",
      linkText: "打开仪表盘",
      sections: [
        {
          heading: "四张真实业绩图",
          content: "这里没有虚拟数据。每条曲线都按真实凭证逐月计算。",
          tips: [
            "💎 1. 真实总利润：已收款销售的毛利，减去全部企业支出（费用、外包、租金），再减去每月发放的工资。",
            "💰 2. 销售走势：开票金额（形式发票与销售）与实际到账金额的直接对比。",
            "💸 3. 企业支出：所有真实付款，含采购单（BC）、运营费用、供应商与工资。",
            "⚡ 4. 业务与运营：售后车间进出场、已出报价与在册车辆档案的真实数量。",
          ],
        },
        {
          heading: "切换时间区间",
          content:
            "右上角可选 1 个月、6 个月、1 年、2 年或 3 年。总计、百分比和月均值会立即跟着变化。",
        },
      ],
    },
    vehicles: {
      title: "3. 车辆、配置单与库存",
      badge: "展厅",
      summary: "在库车辆、已核准的配置单、按单车触发的 AI 生成与正式打印。",
      linkText: "管理车辆库存",
      sections: [
        {
          heading: "配置单与数据库确认",
          content:
            "每辆车都有完整配置单：动力、电池、CLTC/WLTP 续航、尺寸、安全与配置。",
          tips: [
            "OpenAI 按单车生成。只有您为某一张配置单明确触发时 AI 才会运行，其他配置单不消耗额度。",
            "点绿色按钮“Confirmer la fiche technique”（确认配置单），配置单就写入 PostgreSQL 数据库并固化。之后系统始终以数据库中的数据为准。",
            "配置单在同一窗口内打开，看完再返回，位置不会丢失。",
          ],
        },
        {
          heading: "打印与客户报价",
          content:
            "“Imprimer la Fiche Technique”（打印配置单）按钮输出一份正式的高端文档。文字不会被截断或溢出，可以直接交给买家，也能附在形式发票后面。",
        },
      ],
    },
    workshop: {
      title: "4. 售后车间、维修与 Excel 表格",
      badge: "维修车间",
      summary: "维修工单（OR）、诊断，以及 Carzone 官方 Excel 文件。",
      linkText: "查看售后车间",
      sections: [
        {
          heading: "维修工单（OR）的流程",
          content:
            "车辆到厂后，先用车牌号、里程和故障原因建好 OR，再指派技师。接着做技术诊断和配件报价。最后确认施工并登记出场。",
        },
        {
          heading: "Carzone 车间 Excel 表格",
          content: "车间的记录也能直接在 Excel 里用：",
          tips: [
            "“Télécharger Modèle Excel”（下载 Excel 模板）给出官方表格，列名已核准。",
            "“Exporter l'historique en Excel”（导出历史 Excel）把所有进厂记录导出为 .XLSX 文件，可直接交给财务或管理层。",
          ],
        },
      ],
    },
    invoicesExpenses: {
      title: "5. 销售、开票、支出与工资",
      badge: "财务",
      summary: "报价、规范发票、收款登记与运营支出。",
      linkText: "管理开票",
      sections: [
        {
          heading: "发票与客户收款",
          content:
            "先开形式发票，再转成销售发票。收到款项时用“Encaisser”（登记收款）按钮，填入收款方式（转账、支票、现金、Mobile Money）和凭证号。",
          tips: [
            "状态会自动推进：BROUILLON、EN_ATTENTE、PAYEE_PARTIEL、PAYEE。",
            "“Extraction Bilan Financier”（导出财务报表）可以下载完整总账。",
          ],
        },
        {
          heading: "企业支出与采购单（BC）",
          content:
            "在支出（/expenses）里登记外包、供应商采购和租金，系统会自动生成采购单（例如 BC-2026-001）。人力资源模块（/hr）发放的工资也一并汇总。",
        },
      ],
    },
    voipChat: {
      title: "6. VoIP 通话、会议与聊天",
      badge: "沟通",
      summary: "同事之间的语音通话、音频会议室与团队消息。",
      linkText: "打开消息与通话",
      sections: [
        {
          heading: "给同事打电话",
          content:
            "在聊天模块（/chat）或团队通讯录里，点名字旁边的绿色电话图标即可。通话走加密的 WebRTC，只在两台浏览器之间传输。",
        },
        {
          heading: "音频会议室",
          content:
            "常年开放三个会议室：管理层会议、售后车间、销售例会。您可以静音麦克风、实时看到谁在说话，还能一键邀请同事。",
          tips: [
            "先在浏览器里允许使用麦克风，否则对方听不到您。",
            "只有会议室发起人或管理层可以关闭会议室。",
          ],
        },
      ],
    },
    charging: {
      title: "7. 充电桩与前台快速终端",
      badge: "能源",
      summary: "科托努的快速充电网络、VIP 会员价与前台收款终端。",
      linkText: "查看充电桩",
      sections: [
        {
          heading: "价格与会员",
          content:
            "CARZONE SARL 运营一张超快充网络。对外开放价 125 FCFA / kWh，CARZONE VIP 会员价 90 FCFA / kWh。",
        },
        {
          heading: "前台快速终端（/terminal）",
          content:
            "前台或收银员在这里手动录入一次充电。系统自动算出 FCFA 金额，并随即生成对应的充电发票。",
        },
      ],
    },
    security: {
      title: "8. 安全、用户档案与 Bcrypt",
      badge: "安全与审计",
      summary: "密码不可逆加密、角色隔离与访问控制。",
      linkText: "管理用户",
      sections: [
        {
          heading: "账号凭据的保护",
          content: "系统不保存任何明文密码。所有密码都用 Bcrypt 做不可逆哈希。",
          tips: [
            "总经理和管理员可以在用户视图（/users）里为同事设定或重置密码。",
            "闲置会话会自动过期并失效。被停用的同事会立刻断开访问。",
          ],
        },
        {
          heading: "角色与权限",
          content:
            "每个账号都有自己的权限（总经理、ADV、RF、销售、车间主管、人力资源等）。机密数据彼此隔离。",
        },
      ],
    },
  },
};

export const helpCenterCopy: Record<Locale, HelpCenterCopy> = { fr, en, zh };
