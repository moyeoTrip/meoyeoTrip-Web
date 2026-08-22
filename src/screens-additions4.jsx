// changeLog06/07: 방문지 조회와 약관 원문 열람 화면.

const PLACE_TYPES = [
  ['all', '전체'],
  ['spot', '관광지'],
  ['food', '식당'],
  ['stay', '숙박'],
];

function PlaceTypeBadge({ type }) {
  const types = {
    spot: ['관광지', 'pin'],
    food: ['식당', 'money'],
    stay: ['숙박', 'home'],
  };
  const current = types[type] || types.spot;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 22, padding: '0 8px', borderRadius: 999, background: T.bgSubtle, border: `1px solid ${RF.softLine}`, color: T.text700, fontSize: 10.5, fontWeight: 800 }}><Icon name={current[1]} size={11} color={T.text500}/>{current[0]}</span>;
}

function PlaceImage({ src, hue = 'forest', height, radius = 0, overlay = false }) {
  const fallback = <Photo hue={hue} height={height} radius={radius} overlay={overlay}/>;
  if (!src) return fallback;
  return <CachedImage src={src} alt="" fallback={fallback} style={{ display: 'block', width: '100%', height, objectFit: 'cover', borderRadius: radius }}/>; 
}

function ScreenPlaceSearch() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const [type, setType] = React.useState('all');
  const [query, setQuery] = React.useState('청송');
  const deterministic = window.MoyeoTourism.usesDeterministicSamples();
  const [places, setPlaces] = React.useState(deterministic ? window.MoyeoTourism.samplePlaces : []);
  const [source, setSource] = React.useState(deterministic ? 'sample' : 'loading');
  const [error, setError] = React.useState('');
  const loadPlaces = React.useCallback(async () => {
    if (deterministic) return;
    setSource('loading');
    setError('');
    try {
      const response = await window.MoyeoTourism.list();
      setPlaces(response);
      setSource('live');
    } catch (requestError) {
      setPlaces(window.MoyeoTourism.samplePlaces);
      setSource('fallback');
      setError(requestError?.message || '관광 정보에 연결할 수 없어요.');
    }
  }, [deterministic]);
  React.useEffect(() => { loadPlaces(); }, [loadPlaces]);
  const normalizedQuery = query.trim().toLowerCase();
  const visible = places.filter((place) => {
    const matchesType = type === 'all' || place.type === type;
    const matchesQuery = !normalizedQuery || `${place.title} ${place.address}`.toLowerCase().includes(normalizedQuery);
    return matchesType && matchesQuery;
  });
  const openDetail = (contentId) => {
    window.sessionStorage?.setItem('moyeo.selectedTourismContentId', contentId);
    nav.go('place-detail');
  };
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="방문지 검색" left center onBack={nav.back} right={<IconButton name="map"/>}/>
        <div style={{ padding: '0 20px 12px' }}>
          <label style={{ height: 44, borderRadius: 12, border: `1px solid ${T.primary500}`, background: RF.card, display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px' }}>
            <Icon name="search" size={17} color={T.primary600}/><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="방문지 검색어" style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', color: T.text900, fontSize: 13.5, fontWeight: 700 }}/>
            {query && <button type="button" aria-label="검색어 지우기" onClick={() => setQuery('')} style={{ border: 0, padding: 0, background: 'transparent', cursor: 'pointer' }}><Icon name="close" size={15} color={T.text400}/></button>}
          </label>
          <div role="tablist" aria-label="방문지 유형" style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {PLACE_TYPES.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={type === id} onClick={() => setType(id)} style={{ height: 30, padding: '0 12px', borderRadius: 999, border: `1px solid ${type === id ? T.primary500 : T.line200}`, background: type === id ? T.primary50 : RF.card, color: type === id ? T.primary700 : T.text700, fontSize: 12, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>{label}</button>)}
          </div>
        </div>
        <div style={{ position: 'absolute', top: 172, left: 0, right: 0, bottom: 88, overflow: 'auto' }}>
          {source === 'loading' && <div role="status" style={{ margin: '0 20px 10px', padding: '9px 11px', borderRadius: 10, background: T.bgSubtle, color: T.text500, fontSize: 11.5 }}>실시간 관광 정보를 불러오고 있어요.</div>}
          {source === 'fallback' && <div role="status" style={{ margin: '0 20px 10px', padding: '9px 11px', borderRadius: 10, background: T.warningBg, color: T.warningText, fontSize: 11.5, lineHeight: '17px' }}>{error}<br/>예시 장소를 대신 보여드려요. <button type="button" onClick={loadPlaces} style={{ padding: 0, border: 0, background: 'transparent', color: 'inherit', fontWeight: 900, textDecoration: 'underline', cursor: 'pointer' }}>다시 시도</button></div>}
          <div style={{ padding: '0 20px 6px', fontSize: 11.5, color: T.text500 }}>{visible.length}곳 · 주왕산 코스 근처순</div>
          {visible.map((place) => <div key={place.contentId} style={{ width: '100%', display: 'flex', alignItems: 'stretch', borderBottom: `1px solid ${RF.softLine}`, paddingRight: 20 }}>
            <button type="button" onClick={() => openDetail(place.contentId)} style={{ flex: 1, minWidth: 0, display: 'flex', gap: 12, padding: '12px 10px 12px 20px', border: 0, background: 'transparent', color: T.text900, textAlign: 'left', fontFamily: T.fontStack, cursor: 'pointer' }}>
              <span style={{ width: 76, height: 68, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}><PlaceImage src={place.thumbnailUrl} hue={place.hue} height={68}/></span>
              <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><b style={{ fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.title}</b><PlaceTypeBadge type={place.type}/></span><span style={{ display: 'block', marginTop: 4, fontSize: 11.5, lineHeight: '17px', color: T.text500 }}>{place.address}</span><span style={{ display: 'block', marginTop: 5, fontSize: 10.5, color: T.text400 }}>{place.latitude}, {place.longitude}</span></span>
            </button>
            <button type="button" onClick={() => nav.go('custom-course')} aria-label={`${place.title} 코스에 담기`} style={{ alignSelf: 'center', width: 32, height: 32, padding: 0, borderRadius: 999, border: `1px solid ${T.primary500}`, background: T.primary50, display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Icon name="plus" size={16} color={T.primary600}/></button>
          </div>)}
          <p style={{ padding: '12px 20px 24px', margin: 0, fontSize: 11, lineHeight: '17px', color: T.text400 }}>목록에는 제목·주소·썸네일·좌표만 보여요. 전화번호와 소개는 상세에서 확인할 수 있어요.</p>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 24px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', alignItems: 'center', gap: 10 }}><b style={{ flex: 1, fontSize: 12 }}>3곳 담김</b><Btn variant="primary" onClick={() => nav.go('custom-course')}>코스에 반영</Btn></div>
      </div>
    </Phone>
  );
}

function ScreenPlaceDetail() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const [tab, setTab] = React.useState('photo');
  const deterministic = window.MoyeoTourism.usesDeterministicSamples();
  const selectedId = new URLSearchParams(window.location.search).get('contentId') || window.sessionStorage?.getItem('moyeo.selectedTourismContentId') || window.MoyeoTourism.sampleDetail.contentId;
  const [place, setPlace] = React.useState(deterministic ? window.MoyeoTourism.sampleDetail : null);
  const [source, setSource] = React.useState(deterministic ? 'sample' : 'loading');
  const [error, setError] = React.useState('');
  const loadDetail = React.useCallback(async () => {
    if (deterministic) return;
    setSource('loading');
    setError('');
    try {
      setPlace(await window.MoyeoTourism.detail(selectedId));
      setSource('live');
    } catch (requestError) {
      setPlace(window.MoyeoTourism.sampleDetail);
      setSource('fallback');
      setError(requestError?.message || '관광 상세 정보에 연결할 수 없어요.');
    }
  }, [deterministic, selectedId]);
  React.useEffect(() => { loadDetail(); }, [loadDetail]);
  const current = place || {
    type: 'spot', title: '장소 정보를 불러오는 중이에요', address: '', postalCode: '',
    phoneNumber: '', phoneName: '', homepage: '', description: '', images: [], menuImages: [],
    latitude: 0, longitude: 0, hue: 'forest',
  };
  const photoImages = current.images?.length ? current.images : [null, null, null, null, null, null];
  const menuImages = current.menuImages || [];
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, position: 'relative' }}>
        <div style={{ position: 'relative' }}><PlaceImage src={current.images?.[0] || current.thumbnailUrl} hue={current.hue} height={232} overlay/><div style={{ position: 'absolute', top: 52, left: 18 }}><IconButton name="back" onClick={nav.back} bg={T.overlayPanel}/></div><span style={{ position: 'absolute', right: 18, bottom: 14, padding: '5px 9px', borderRadius: 999, background: 'rgba(0,0,0,.58)', color: '#fff', fontSize: 11, fontWeight: 800 }}>1 / {Math.max(1, current.images?.length || 1)}</span></div>
        <div style={{ position: 'absolute', top: 212, left: 0, right: 0, bottom: 88, borderRadius: '20px 20px 0 0', background: RF.bg, overflow: 'auto', padding: '18px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><h1 style={{ flex: 1, margin: 0, fontSize: 19, lineHeight: '26px' }}>{current.title}</h1><PlaceTypeBadge type={current.type}/></div>
          {source === 'loading' && <div role="status" style={{ marginTop: 12, fontSize: 11.5, color: T.text500 }}>실시간 상세 정보를 불러오고 있어요.</div>}
          {source === 'fallback' && <div role="status" style={{ marginTop: 12, padding: '9px 11px', borderRadius: 10, background: T.warningBg, color: T.warningText, fontSize: 11.5, lineHeight: '17px' }}>{error}<br/>예시 상세를 대신 보여드려요. <button type="button" onClick={loadDetail} style={{ padding: 0, border: 0, background: 'transparent', color: 'inherit', fontWeight: 900, textDecoration: 'underline', cursor: 'pointer' }}>다시 시도</button></div>}
          <div style={{ marginTop: 14, padding: 14, display: 'grid', gap: 11, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card }}>
            {[
              ['pin', current.address || '주소 정보 없음', current.postalCode ? `우편번호 ${current.postalCode}` : '우편번호 정보 없음'],
              ['phone', current.phoneNumber || '전화번호 정보 없음', current.phoneName || '안내명 정보 없음'],
              ['map', `${current.latitude}, ${current.longitude}`, '지도에서 열기'],
              ['share', current.homepage || '홈페이지 정보 없음', '홈페이지'],
            ].map((row) => <div key={`${row[0]}-${row[1]}`} style={{ display: 'flex', gap: 10 }}><Icon name={row[0]} size={16} color={T.text500}/><span><b style={{ display: 'block', fontSize: 12.5, wordBreak: 'break-all' }}>{row[1]}</b><span style={{ display: 'block', marginTop: 2, fontSize: 10.5, color: T.text500 }}>{row[2]}</span></span></div>)}
          </div>
          <h2 style={{ margin: '20px 0 8px', fontSize: 13 }}>소개</h2><p style={{ margin: 0, fontSize: 12.5, lineHeight: '20px', color: T.text700 }}>{current.description || '상세 소개가 제공되지 않았어요.'}</p>
          <div role="tablist" aria-label="장소 이미지" style={{ display: 'flex', gap: 18, marginTop: 20, borderBottom: `1px solid ${RF.softLine}` }}>{[
            ['photo', `사진 ${current.images?.length || 0}`],
            ...(current.type === 'food' ? [['menu', `메뉴판 ${menuImages.length}`]] : []),
          ].map(([id,label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} style={{ padding: '0 0 9px', border: 0, borderBottom: tab === id ? `2px solid ${T.primary500}` : '2px solid transparent', background: 'transparent', color: tab === id ? T.primary600 : T.text500, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>{label}</button>)}</div>
          <div style={{ display: 'grid', gridTemplateColumns: tab === 'photo' ? 'repeat(3,1fr)' : 'repeat(2,1fr)', gap: 7, marginTop: 12 }}>{(tab === 'photo' ? photoImages : menuImages).map((item, index) => <div key={`${tab}-${item || index}`} style={{ overflow: 'hidden', borderRadius: 8, border: `1px solid ${RF.softLine}` }}><PlaceImage src={item} hue={index % 2 ? 'pebble' : current.hue} height={tab === 'photo' ? 78 : 88}/></div>)}</div>
          {current.type === 'food' && <p style={{ margin: '14px 0 0', fontSize: 11, lineHeight: '17px', color: T.text400 }}>메뉴판 탭은 음식점 콘텐츠에서만 보여요.</p>}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 24px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8 }}><Btn variant="ghost" onClick={nav.back}>목록으로</Btn><div style={{ flex: 1 }}><Btn variant="primary" full icon="plus" onClick={() => nav.go('custom-course')}>이 장소를 코스에 담기</Btn></div></div>
      </div>
    </Phone>
  );
}

const TERMS_DOCUMENTS = {
  service: { title: '이용약관', required: true, version: 'v1.2', date: '2026년 5월 1일 시행', summary: '모여트립을 쓰면서 지켜야 할 것과, 우리가 약속하는 것을 적었어요.', sections: [['제1조 (목적)', '경상북도 여행 코스 기반 동행 매칭 서비스의 이용 조건과 회사와 회원의 권리·의무를 정합니다.'], ['제2조 (모집의 성립과 소멸)', '모집은 마감일까지 최소 인원 3명을 충족한 경우 확정되며, 미달한 모집은 자동으로 소멸합니다.'], ['제3조 (여행 중 발생하는 사항)', '회사는 회원 간 만남을 매개할 뿐 이동·숙박·식음 계약의 당사자가 아닙니다.'], ['제4조 (계정과 닉네임)', '가입 시 선택한 닉네임과 캐릭터는 도감 기록의 동일성을 위해 변경되지 않습니다.']] },
  privacy: { title: '개인정보 처리방침', required: true, version: 'v1.4', date: '2026년 7월 10일 시행', summary: '어떤 정보를 왜 받고, 얼마나 보관하는지 적었어요.', sections: [['수집하는 정보', '소셜 로그인 식별자, 생년, 성별과 서비스 이용 과정에서 작성한 모집·채팅·피드 내용을 저장합니다.'], ['다른 회원에게 보이는 정보', '닉네임·캐릭터·나이대·성별·매너 점수·여행 횟수만 공개합니다.'], ['보관 기간', '탈퇴 시 30일간 보관 후 삭제하며 신고·분쟁 이력은 법령이 정한 기간 동안 별도 보관합니다.']] },
  location: { title: '위치정보 이용 동의', required: false, version: 'v1.0', date: '2026년 5월 1일 시행', summary: '켜지 않아도 서비스를 쓸 수 있어요. 켜면 근처 모집을 먼저 보여드려요.', sections: [['이용 목적', '현재 위치 기준 근처 모집과 집합 장소까지의 길 찾기를 제공합니다.'], ['동의를 거부할 경우', '근처 모집과 길 찾기만 제한되고 나머지 기능은 그대로 이용할 수 있습니다.']] },
  marketing: { title: '마케팅 정보 수신 동의', required: false, version: 'v1.0', date: '2026년 5월 1일 시행', summary: '새 코스나 이벤트 소식을 받아볼지 정하는 항목이에요.', sections: [['보내는 내용', '계절별 신규 코스, 지역 축제와 이벤트 안내를 앱 푸시로 보냅니다.'], ['보내지 않는 것', '모집 승인·채팅·마감 임박 알림은 이 동의와 무관합니다.'], ['철회 방법', '설정의 알림 메뉴에서 언제든 끌 수 있습니다.']] },
};

function ScreenTermsDetail({ doc = 'service', from = 'signup' }) {
  const nav = window.useNav ? window.useNav() : { back: () => {} };
  const current = TERMS_DOCUMENTS[doc];
  return <Phone><div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
    <Header title={current.title} left center onBack={nav.back} right={<IconButton name="share"/>}/>
    <main style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: from === 'signup' ? 96 : 0, overflow: 'auto', padding: '6px 20px 24px' }}>
      <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}><Chip variant={current.required ? 'soft' : 'neutral'}>{current.required ? '필수' : '선택'}</Chip><span style={{ fontSize: 11.5, color: T.text500 }}>{current.version} · {current.date}</span></div>
      <div style={{ marginTop: 12, padding: 13, borderRadius: 12, background: T.bgSubtle, border: `1px solid ${RF.softLine}`, fontSize: 12.5, lineHeight: '19px', color: T.text700 }}>{current.summary}</div>
      {current.sections.map(([title, body]) => <section key={title} style={{ marginTop: 22 }}><h2 style={{ margin: 0, fontSize: 13.5 }}>{title}</h2><p style={{ margin: '8px 0 0', fontSize: 12.5, lineHeight: '21px', color: T.text700 }}>{body}</p></section>)}
      <p style={{ margin: '26px 0 0', paddingTop: 16, borderTop: `1px solid ${RF.softLine}`, fontSize: 11.5, lineHeight: '18px', color: T.text500 }}>이전 판본은 <b>설정 › 이용약관 › 지난 버전</b>에서 볼 수 있어요. 약관이 바뀌면 시행 7일 전에 공지와 푸시로 알려드려요.</p>
    </main>
    {from === 'signup' && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8 }}><Btn variant="ghost" onClick={nav.back}>닫기</Btn><div style={{ flex: 1 }}><Btn variant="primary" full onClick={nav.back}>{current.required ? '동의하고 돌아가기' : '이 항목에 동의하기'}</Btn></div></div>}
  </div></Phone>;
}

function ScreenTermsPrivacy() { return <ScreenTermsDetail doc="privacy"/>; }
function ScreenTermsLocation() { return <ScreenTermsDetail doc="location"/>; }
function ScreenTermsMarketing() { return <ScreenTermsDetail doc="marketing"/>; }
function ScreenTermsSettings() { return <ScreenTermsDetail doc="service" from="settings"/>; }
function ScreenPrivacySettings() { return <ScreenTermsDetail doc="privacy" from="settings"/>; }
function ScreenLocationSettings() { return <ScreenTermsDetail doc="location" from="settings"/>; }
function ScreenMarketingSettings() { return <ScreenTermsDetail doc="marketing" from="settings"/>; }

Object.assign(window, { PlaceTypeBadge, ScreenPlaceSearch, ScreenPlaceDetail, ScreenTermsDetail, ScreenTermsPrivacy, ScreenTermsLocation, ScreenTermsMarketing, ScreenTermsSettings, ScreenPrivacySettings, ScreenLocationSettings, ScreenMarketingSettings });
