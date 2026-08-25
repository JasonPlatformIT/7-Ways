/**
 * CMS DATA - Edit this file to manage the roster.
 * 
 * Each person needs:
 *   - id: unique number
 *   - name: display name
 *   - photo: URL to image (or path to local image)
 *   - nationality: country / flag description
 *   - available: array of "today", "tomorrow", or both
 *
 * Pricing & Contact text are stored per language (en, ja, zh, ko).
 * You can also edit them on the Pricing / Contact pages – changes are saved in the browser.
 */

const CMS_DATA = {
  people: [
    {
      id: 1,
      name: "Sophia Laurent",
      photos: ["https://picsum.photos/id/64/400/500"],
      photo: "https://picsum.photos/id/64/400/500",
      nationality: "French",
      available: ["today", "tomorrow"],
      description: "Elegant and sophisticated. Enjoys fine dining and interesting conversation."
    },
    {
      id: 2,
      name: "Isabella Rossi",
      photos: ["https://picsum.photos/id/65/400/500"],
      photo: "https://picsum.photos/id/65/400/500",
      nationality: "Italian",
      available: ["today"],
      description: "Warm personality with a passion for art and travel."
    },
    {
      id: 3,
      name: "Emma Johansson",
      photos: ["https://picsum.photos/id/91/400/500"],
      photo: "https://picsum.photos/id/91/400/500",
      nationality: "Swedish",
      available: ["tomorrow"],
      description: "Calm and friendly. Loves outdoor activities and good music."
    },
    {
      id: 4,
      name: "Mia Chen",
      photos: ["https://picsum.photos/id/177/400/500"],
      photo: "https://picsum.photos/id/177/400/500",
      nationality: "Chinese",
      available: ["today", "tomorrow"],
      description: "Charming and well-travelled. Speaks multiple languages."
    },
    {
      id: 5,
      name: "Olivia Müller",
      photos: ["https://picsum.photos/id/338/400/500"],
      photo: "https://picsum.photos/id/338/400/500",
      nationality: "German",
      available: ["today"],
      description: "Professional and discreet. Enjoys theatre and city walks."
    },
    {
      id: 6,
      name: "Ava Petrov",
      photos: ["https://picsum.photos/id/342/400/500"],
      photo: "https://picsum.photos/id/342/400/500",
      nationality: "Russian",
      available: ["tomorrow"],
      description: "Striking presence with a love of fashion and culture."
    },
    {
      id: 7,
      name: "Chloe Dubois",
      photos: ["https://picsum.photos/id/1011/400/500"],
      photo: "https://picsum.photos/id/1011/400/500",
      nationality: "Canadian",
      available: ["today", "tomorrow"],
      description: "Fun and outgoing. Great company for evenings out."
    },
    {
      id: 8,
      name: "Luna Santos",
      photos: ["https://picsum.photos/id/1027/400/500"],
      photo: "https://picsum.photos/id/1027/400/500",
      nationality: "Brazilian",
      available: ["tomorrow"],
      description: "Vibrant energy and a warm smile. Loves dancing and good food."
    }
  ],

  // Default text content PER LANGUAGE
  // Keys: en, ja, zh, ko
  pricingText: {
    en: `Our rates are competitive and transparent.

• 1 Hour: $300
• 2 Hours: $500
• Overnight: $1200
• Weekend packages available on request

All bookings include travel within the city. Additional travel fees may apply outside the metro area.

Contact us for custom arrangements or longer bookings.`,

    ja: `料金は競争力があり、明確です。

• 1時間: $300
• 2時間: $500
• 一晩: $1200
• 週末パッケージはご要望に応じてご用意

市内の移動は含まれます。市外は追加料金がかかる場合があります。

カスタムや長時間のご予約はお問い合わせください。`,

    zh: `我们的价格具有竞争力且透明。

• 1小时: $300
• 2小时: $500
• 过夜: $1200
• 周末套餐可按要求提供

市内交通已包含。市外可能产生额外交通费。

如需定制或更长时间预订，请联系我们。`,

    ko: `요금은 경쟁력 있고 투명합니다.

• 1시간: $300
• 2시간: $500
• 숙박: $1200
• 주말 패키지는 요청 시 가능

시내 이동은 포함됩니다. 시외는 추가 요금이 발생할 수 있습니다.

맞춤 또는 장시간 예약은 문의해 주세요.`
  },

  contactText: {
    en: `We are available 24/7 for inquiries and bookings.

Phone: +1 (555) 123-4567
Email: bookings@example.com
WhatsApp: +1 (555) 123-4567

Location: Downtown Metro Area

Please provide preferred date, time, and any special requests when contacting us. We respond within 15 minutes during business hours.`,

    ja: `お問い合わせ・ご予約は24時間対応しています。

電話: +1 (555) 123-4567
メール: bookings@example.com
WhatsApp: +1 (555) 123-4567

場所: ダウンタウン・メトロエリア

ご希望の日時や特別なご要望をお知らせください。営業時間内は15分以内に返信します。`,

    zh: `我们全天候接受咨询和预订。

电话: +1 (555) 123-4567
邮箱: bookings@example.com
WhatsApp: +1 (555) 123-4567

地点: 市中心都会区

联系时请提供首选日期、时间和任何特殊要求。营业时间内我们会在15分钟内回复。`,

    ko: `문의 및 예약은 연중무휴 24시간 가능합니다.

전화: +1 (555) 123-4567
이메일: bookings@example.com
WhatsApp: +1 (555) 123-4567

위치: 다운타운 메트로 지역

연락 시 원하시는 날짜, 시간 및 특별 요청 사항을 알려 주세요. 영업 시간 내 15분 이내에 답변드립니다.`
  }
};
