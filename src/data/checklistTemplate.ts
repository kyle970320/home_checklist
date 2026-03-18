import type {
  ChecklistCalculator,
  ChecklistChoice,
  ChecklistSection,
} from "../types/checklist";

type TemplateItem = {
  label: string;
  hint?: string;
  calculator?: ChecklistCalculator;
  choice?: ChecklistChoice;
};

function createItems(
  sectionId: string,
  groupId: string,
  items: TemplateItem[],
) {
  return items.map((item, index) => ({
    id: `${sectionId}-${groupId}-${index + 1}`,
    label: item.label,
    hint: item.hint,
    checked: false,
    calculator: item.calculator,
    choice: item.choice,
  }));
}

function createDepositRatioCalculator(): ChecklistCalculator {
  return {
    mode: "deposit-ratio",
    marketPrice: "",
    deposit: "",
    maxDebt: "",
    safePercent: "70",
  };
}

function createIncludedSeparateChoice(): ChecklistChoice {
  return {
    mode: "included-separate",
    value: null,
  };
}

export function createDefaultChecklistSections(): ChecklistSection[] {
  return [
    {
      id: "registry",
      title: "등기부등본",
      description: "권리관계와 계약 상대방, 보증금 위험도를 먼저 확인하세요.",
      tone: "warning",
      groups: [
        {
          id: "title-part",
          title: "1. 표제부",
          items: createItems("registry", "title-part", [
            {
              label: "계약서 전용 면적과 표제부 전용면적이 일치하는지 확인하기",
            },
            { label: "건물 용도가 주거용 또는 오피스텔인지 확인하기" },
          ]),
        },
        {
          id: "section-a",
          title: "2. 갑구",
          description: "아래 용어가 보이면 위험 신호로 보고 신중히 검토하세요.",
          items: createItems("registry", "section-a", [
            { label: "최근 소유자와 임대인이 일치하는지 확인하기" },
            {
              label: "가등기가 있는지 확인하기",
              hint: "집주인이 바뀔 가능성이 있어 피하는 편이 좋아요.",
            },
            {
              label: "신탁이 있는지 확인하기",
              hint: "신탁회사 담보 대출 여부를 꼭 체크하세요.",
            },
            {
              label: "압류 또는 가압류가 있는지 확인하기",
              hint: "채권자가 집을 가져갈 수 있는 위험이 있어요.",
            },
            { label: "경매개시결정이 있는지 확인하기" },
            {
              label: "임차권등기명령이 있는지 확인하기",
              hint: "이전 세입자가 보증금을 못 받은 이력이 있을 수 있어요.",
            },
          ]),
        },
        {
          id: "section-b",
          title: "3. 을구",
          description:
            "대출과 보증금 비율을 함께 보고 과도한 권리 설정은 피하세요.",
          items: createItems("registry", "section-b", [
            { label: "전세권 설정 또는 임차권 설정이 없는지 확인하기" },
            {
              label:
                "채권최고액 + 보증금이 주택 시세의 안전 기준 이내인지 계산하기",
              hint: "시세는 억원, 보증금과 채권최고액은 천만원 단위로 넣으면 자동 계산돼요.",
              calculator: createDepositRatioCalculator(),
            },
            {
              label: "임차권 등기가 없는지 다시 한 번 확인하기",
              hint: "임차권 등기는 꼭 피하는 편이 좋아요.",
            },
          ]),
        },
      ],
    },
    {
      id: "onsite",
      title: "월세 체크리스트",
      description:
        "실제 방문했을 때 외부 환경부터 내부 상태까지 빠짐없이 점검하세요.",
      tone: "default",
      groups: [
        {
          id: "outside",
          title: "1. 외부 요소",
          items: createItems("onsite", "outside", [
            { label: "햇볕이 잘 들어오는지 확인하기" },
            { label: "환기가 잘 되는지 확인하기" },
            {
              label: "창문을 열었을 때 옆 건물과 적절한 거리가 있는지 확인하기",
            },
            { label: "층간소음이 심하지 않은지 확인하기" },
            {
              label:
                "술집, 고깃집 등 소음을 유발하는 시설이 주변에 있는지 확인하기",
            },
          ]),
        },
        {
          id: "bathroom",
          title: "2. 욕실 환경",
          items: createItems("onsite", "bathroom", [
            { label: "변기, 샤워기, 수도꼭지 등의 수압이 적절한지 확인하기" },
            { label: "세면대, 샤워실, 싱크대 배수가 잘 되는지 확인하기" },
            { label: "온수가 잘 나오는지 확인하기" },
            {
              label: "화장실 하수구와 싱크대 개수구에서 냄새가 나는지 확인하기",
            },
          ]),
        },
        {
          id: "interior",
          title: "3. 내부 시설",
          items: createItems("onsite", "interior", [
            {
              label: "유리창과 창틀 사이에 빈틈이 없는지 확인하기",
              hint: "외풍과 단열 상태를 함께 보세요.",
            },
            { label: "고장 난 전기 콘센트가 없는지 확인하기" },
            {
              label: "주방시설이 잘 작동하는지 확인하기",
              hint: "가스레인지, 인덕션, 전자레인지 등을 함께 체크하세요.",
            },
            {
              label: "파손된 부분이 있는지 확인하기",
              hint: "수납장, 싱크대, 거울 등을 살펴보세요.",
            },
            { label: "에어컨, 냉장고, 세탁기, TV 등이 잘 작동하는지 확인하기" },
          ]),
        },
        {
          id: "living",
          title: "4. 생활환경",
          items: createItems("onsite", "living", [
            { label: "빨래를 건조할 수 있는 공간이 충분한지 확인하기" },
            { label: "발코니나 베란다가 있는지 확인하기" },
          ]),
        },
        {
          id: "safety",
          title: "5. 주차공간, 방범·보안, 누수 점검",
          items: createItems("onsite", "safety", [
            { label: "주차공간과 월 주차 비용을 확인하기" },
            { label: "방범창이 튼튼하게 설치되어 있는지 확인하기" },
            { label: "현관 출입문에 도어록이 설치되어 있는지 확인하기" },
            { label: "주택에 CCTV가 설치되어 있는지 확인하기" },
            { label: "누수, 곰팡이, 결로 문제가 없는지 전반적으로 확인하기" },
            {
              label:
                "벽면과 맞닿아 있는 장판 끝부분을 들춰 물기가 있는지 확인하기",
            },
            {
              label:
                "천장 가장자리나 벽체에 물이 흘러내린 흔적이 있는지 확인하기",
            },
            { label: "벽지 얼룩, 변색, 들뜸 등 누수 흔적이 있는지 확인하기" },
            { label: "장롱 뒤편 벽면에 곰팡이가 있는지 확인하기" },
            { label: "창틀 주변이나 욕실 근처에 곰팡이가 있는지 확인하기" },
            {
              label: "창가, 베란다, 외벽 쪽에 물방울 맺힘이 있는지 확인하기",
              hint: "결로 여부를 확인하세요.",
            },
            {
              label:
                "결로로 인해 페인트 벗겨짐이나 벽지 손상 흔적이 있는지 확인하기",
            },
          ]),
        },
        {
          id: "maintenance",
          title: "6. 관리비 포함 항목",
          items: createItems("onsite", "maintenance", [
            { label: "공용", choice: createIncludedSeparateChoice() },
            { label: "수도세", choice: createIncludedSeparateChoice() },
            { label: "전기세", choice: createIncludedSeparateChoice() },
            { label: "도시가스", choice: createIncludedSeparateChoice() },
            { label: "난방", choice: createIncludedSeparateChoice() },
            { label: "기타", choice: createIncludedSeparateChoice() },
          ]),
        },
      ],
    },
    {
      id: "special-terms",
      title: "특약사항",
      description:
        "계약서에 꼭 반영해 두면 보증금 보호에 도움이 되는 문구들이에요.",
      tone: "accent",
      groups: [
        {
          id: "terms",
          title: "계약서 특약",
          items: createItems("special-terms", "terms", [
            {
              label:
                "임대인은 임차인의 대항력이 발생되기 전까지 근저당 등 추가 등기를 설정하지 않기로 한다.",
            },
            {
              label:
                "임차인이 전세보증금 반환보증보험 가입을 신청했으나, 가입이 거절될 경우 계약은 즉시 해제되며 임대인은 계약금 전액을 즉시 반환한다.",
            },
            {
              label:
                "임대차 계약 만료 시 임대인은 타 임차인의 임대 여부와 상관없이 보증금을 즉시 반환해야 한다.",
            },
            {
              label:
                "임대인은 본 주택의 매매계약을 체결하는 경우 사전에 임차인에게 고지하여야 한다.",
            },
          ]),
        },
      ],
    },
  ];
}
