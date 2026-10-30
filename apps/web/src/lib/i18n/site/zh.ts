import type { SiteCopy } from "./types";

export const zh: SiteCopy = {
  meta: {
    home: {
      title: "CARZONE SARL | 科托努多品牌汽车经销商",
      description:
        "长安、捷途、比亚迪、吉利、北汽、福田戴尔和丰田展厅，位于科托努。新车销售、售后维修及电动汽车充电方案。",
    },
    vehicules: {
      title: "现车展示 | CARZONE SARL",
      description:
        "浏览科托努展厅现有的新车：SUV、轿车、皮卡及各品牌电动车型。",
    },
    surMesure: {
      title: "定制订购与进口 | CARZONE SARL",
      description:
        "通过 CARZONE SARL 配置您的专属车型并直接向工厂下单，从订购到贝宁交付全程陪同。",
    },
    services: {
      title: "售后维修与保养 | CARZONE SARL",
      description:
        "CARZONE 维修车间为您的爱车提供定期保养、故障诊断及原厂配件更换服务。",
    },
    recharge: {
      title: "电动汽车充电方案 | CARZONE SARL",
      description:
        "面向家庭与企业的充电桩方案，提供安装及后续支持服务。",
    },
    equipe: {
      title: "我们的团队 | CARZONE SARL",
      description:
        "认识 CARZONE SARL 团队：管理层、展厅销售、售后维修、充电与能源、进口及行政部门。",
    },
    contact: {
      title: "联系方式与展厅位置 | CARZONE SARL",
      description:
        "CARZONE SARL 科托努展厅地址、电话及路线指引，位于 Maro-Militaire 区 Gbèdomidji 街区。",
    },
  },

  nav: {
    home: "首页",
    vehicules: "车辆",
    surMesure: "定制订购",
    services: "服务",
    recharge: "充电",
    equipe: "团队",
    contact: "联系我们",
    ariaLabel: "主导航",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    languageLabel: "语言",
    proSpace: "专业空间",
  },

  common: {
    skipToContent: "跳转到主要内容",
    whatsapp: "WhatsApp",
    callUs: "致电我们",
    emailUs: "发送邮件",
    viewVehicles: "查看车辆",
    contactUs: "联系我们",
    discoverMore: "了解更多",
    getDirections: "查看路线",
  },

  footer: {
    tagline: "科托努多品牌汽车经销商：展厅、售后维修及电动汽车充电方案。",
    addressTitle: "展厅",
    contactTitle: "联系方式",
    hoursTitle: "营业时间",
    hoursNote: "具体营业时间待确认，来访前请先联系我们。",
    navTitle: "导航",
    legalTitle: "法律信息",
    ifuLabel: "税务识别号 (IFU)",
    rccmLabel: "商业注册号 (RCCM)",
    rightsReserved: "版权所有。",
    socialTitle: "社交媒体",
  },

  home: {
    hero: {
      eyebrow: "科托努多品牌经销商",
      title: "您的下一辆车，从 CARZONE 开始",
      subtitle: "新车展厅、售后维修车间与电动汽车充电方案，齐聚科托努同一地点。",
      primaryCta: "查看车辆",
      secondaryCta: "联系我们",
      imageAlt: "CARZONE SARL 展厅展出车辆",
    },
    stats: [
      { value: "9", label: "展厅展示品牌数量" },
      { value: "0", label: "现车可售数量" },
      { value: "3", label: "专业领域：展厅、售后维修、充电" },
    ],
    pillars: {
      eyebrow: "我们的业务",
      title: "三大专业领域，同一地址",
      subtitle: "展厅、维修车间与电动充电服务汇聚一处，从购车第一天到日常保养全程支持。",
      items: [
        {
          title: "新车展厅",
          description: "长安、捷途、比亚迪、吉利、北汽、福田戴尔、奇瑞及丰田车型在科托努展出，配备专属销售顾问。",
          href: "/vehicules",
          linkLabel: "探索展厅",
        },
        {
          title: "工厂定制订购",
          description: "配置您心仪的车型并直接向工厂下单，全程陪同直至贝宁交付。",
          href: "/sur-mesure",
          linkLabel: "配置车辆",
        },
        {
          title: "售后维修车间",
          description: "定期保养、故障诊断及原厂配件更换，让您的爱车始终保持最佳状态。",
          href: "/nos-services",
          linkLabel: "查看维修服务",
        },
        {
          title: "电动汽车充电",
          description: "面向家庭与企业的充电桩方案，提供安装及后续支持服务。",
          href: "/recharge",
          linkLabel: "探索充电方案",
        },
      ],
    },
    vehicles: {
      eyebrow: "展厅",
      title: "精选车辆",
      subtitle: "展厅内现有新车精选展示。",
      emptyMessage: "新车即将抵达展厅，请联系我们了解最新库存情况。",
      viewAllCta: "查看全部车辆",
      priceOnRequest: "价格面议",
      viewDetails: "查看详情",
      newBadge: "新车",
      comingSoonBadge: "即将上市",
    },
    team: {
      eyebrow: "CARZONE 团队",
      title: "每个环节都有专属团队",
      description:
        "管理层、展厅销售、售后维修、充电与能源、进口及行政部门：按专业领域组织的团队，从选车到保养全程为您服务。",
      cta: "认识团队",
    },
    faq: {
      title: "常见问题",
      items: [
        {
          question: "可以订购展厅暂无现车的车型吗？",
          answer: "可以。CARZONE SARL 提供工厂定制订购服务：您选择车型与配置，我们负责下单及进口至贝宁的全部流程。",
        },
        {
          question: "售后维修车间是否仅服务于在 CARZONE 购买的车辆？",
          answer: "并非如此。CARZONE SARL 维修车间为各品牌车辆提供保养与诊断服务，不限于展厅购买的车型。",
        },
        {
          question: "是否提供充电桩安装服务？",
          answer: "是的，CARZONE SARL 为个人及企业客户提供电动汽车充电方案的安装支持。",
        },
      ],
    },
    finalCta: {
      title: "有购车需求或疑问？",
      subtitle: "我们的展厅团队随时通过电话、邮件或 WhatsApp 为您解答。",
      primaryCta: "联系 CARZONE",
      secondaryCta: "通过 WhatsApp 留言",
    },
  },
};
