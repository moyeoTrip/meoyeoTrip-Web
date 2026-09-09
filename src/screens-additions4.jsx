// changeLog06/07: 방문지 조회와 약관 원문 열람 화면.

const PLACE_TYPES = [
  ['all', '전체'],
  ['spot', '관광지'],
  ['food', '식당'],
  ['stay', '숙박'],
];

function PlaceTypeBadge({ type, label }) {
  const types = {
    spot: ['관광지', 'pin'],
    food: ['식당', 'money'],
    stay: ['숙박', 'home'],
  };
  const current = types[type] || types.spot;
  // label 이 오면(서버 contentTypeName) 그 이름을 그대로 쓴다 — 유형 이름을 FE가 다시 지어내지 않는다.
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 22, padding: '0 8px', borderRadius: 999, background: T.bgSubtle, border: `1px solid ${RF.softLine}`, color: T.text700, fontSize: 10.5, fontWeight: 800 }}><Icon name={current[1]} size={11} color={T.text500}/>{label || current[0]}</span>;
}

// TourAPI 원본 이미지(tong.visitkorea.or.kr)는 CORS 헤더를 주지 않아
// CachedImage 의 fetch+Cache 방식으로는 읽을 수 없다. 외부 호스트 이미지는 <img> 로 바로 띄우고
// 실패하면 기존 자리표시자로 돌아간다 (앱 자체 에셋은 그대로 CachedImage 를 쓴다).
function RemotePlaceImage({ src, fallback, style }) {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => { setFailed(false); }, [src]);
  if (failed) return fallback;
  return <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} style={style}/>;
}

// shape: 이미지가 없거나 실패했을 때 채울 마스코트 플레이스홀더의 비율('square' | 'landscape').
// 관광 데이터는 이미지가 간헐적으로 비어 있는데 화면기획은 사진이 항상 있다고 보고 그려져 있다.
// 로딩 중에는 그라디언트(Photo)를 두고, 없거나 실패한 뒤에만 마스코트를 그린다 —
// 로딩 중에 마스코트를 먼저 보이면 사진이 뒤늦게 갈리며 화면이 튄다.
function PlaceImage({ src, hue = 'forest', height, radius = 0, overlay = false, shape = 'square' }) {
  const loading = <Photo hue={hue} height={height} radius={radius} overlay={overlay}/>;
  const style = { display: 'block', width: '100%', height, objectFit: 'cover', borderRadius: radius };
  const placeholder = (
    <img src={window.MoyeoImageCache.placeholderSources[shape]} alt="" style={style}/>
  );
  if (!src) return placeholder;
  const external = /^https?:\/\//i.test(src) && !src.startsWith(`${window.location.origin}/`);
  if (external) return <RemotePlaceImage src={src} fallback={placeholder} style={style}/>;
  return <CachedImage src={src} alt="" fallback={loading} fallbackShape={shape} style={style}/>;
}

function ScreenPlaceSearch() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const [type, setType] = React.useState('all');
  // 헤더 우측 "지도에서 보기". 안드로이드 place-search-map-toggle 과 같은 자리다 —
  // 웹은 버튼만 두고 지도를 그리지 않아 이 섹션이 통째로 빠져 있었다.
  const [showsMap, setShowsMap] = React.useState(false);
  // 2026-08-25 서버 패치로 GET /tourism-contents 가 keyword 검색을 지원한다 —
  // 검색어를 서버로 넘기고 클라이언트 필터는 쓰지 않는다(이중 필터 금지).
  const [query, setQuery] = React.useState('');
  const [keyword, setKeyword] = React.useState('');
  const [places, setPlaces] = React.useState([]);
  const [total, setTotal] = React.useState(null);
  const [source, setSource] = React.useState('loading');
  // 타자 한 글자마다 요청하지 않도록 입력이 멈춘 뒤에 검색어를 확정한다.
  React.useEffect(() => {
    const timer = window.setTimeout(() => setKeyword(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);
  // GET tourism-contents/types — 유형 후보는 서버 값(7종)을 쓴다. 실패하면 기존 3종 칩이 남는다.
  const [serverTypes, setServerTypes] = React.useState(null);
  React.useEffect(() => {
    let active = true;
    window.MoyeoTourism.types()
      .then((result) => { if (active && result.length) { setServerTypes(result); setType('all'); } })
      .catch(() => { /* 실패 시 기존 유형 칩 유지 */ });
    return () => { active = false; };
  }, []);
  const typeFilter = serverTypes && type !== 'all' ? type : null;
  const loadPlaces = React.useCallback(async () => {
    setSource('loading');
    try {
      // 검색어와 유형(contentTypeId)을 함께 서버로 보낸다. 검색어가 비면 파라미터가 빠져 전체 조회다.
      const response = await window.MoyeoTourism.list({ keyword, contentTypeId: typeFilter, size: 30 });
      setPlaces(response.items);
      setTotal(response.totalElements);
      setSource('live');
    } catch (_) {
      // 실패는 오류 상태로 끝낸다 — 예시 장소로 목록을 채우면 없는 곳을 코스에 담게 된다.
      setPlaces([]);
      setTotal(null);
      setSource('error');
    }
  }, [keyword, typeFilter]);
  React.useEffect(() => { loadPlaces(); }, [loadPlaces]);
  const typeNames = React.useMemo(() => {
    const map = new Map();
    (serverTypes || []).forEach((item) => map.set(item.contentTypeId, item.contentTypeName));
    return map;
  }, [serverTypes]);
  const typeChips = serverTypes
    ? [['all', '전체'], ...serverTypes.map((item) => [item.contentTypeId, item.contentTypeName])]
    : PLACE_TYPES;
  // 서버가 keyword·contentTypeId 로 이미 걸러 준 목록이라 그대로 그린다.
  const visible = places;
  // 건수는 서버가 준 totalElements 를 쓴다(클라가 센 값은 현재 페이지 분량뿐이다).
  const visibleCount = total === null ? visible.length : total;
  // 좌표가 (0,0)인 콘텐츠는 지도에 올릴 근거가 없다 — 마커에서 뺀다.
  const mapMarkers = React.useMemo(() => visible
    .filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude)
      && !(place.latitude === 0 && place.longitude === 0))
    .map((place, index) => ({ lat: place.latitude, lng: place.longitude, label: String(index + 1) })), [visible]);
  const openDetail = (contentId) => {
    window.sessionStorage?.setItem('moyeo.selectedTourismContentId', contentId);
    nav.go('place-detail');
  };
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="방문지 검색" left center onBack={nav.back} right={<IconButton name="map" ariaLabel="지도에서 보기" onClick={() => setShowsMap((value) => !value)}/>}/>
        <div style={{ padding: '0 20px 12px' }}>
          <label style={{ height: 44, borderRadius: 12, border: `1px solid ${T.primary500}`, background: RF.card, display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px' }}>
            <Icon name="search" size={17} color={T.primary600}/><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="방문지 검색어" style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', color: T.text900, fontSize: 13.5, fontWeight: 700 }}/>
            {query && <button type="button" aria-label="검색어 지우기" onClick={() => setQuery('')} style={{ border: 0, padding: 0, background: 'transparent', cursor: 'pointer' }}><Icon name="close" size={15} color={T.text400}/></button>}
          </label>
          <div role="tablist" aria-label="방문지 유형" style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto' }}>
            {typeChips.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={type === id} onClick={() => setType(id)} style={{ height: 30, padding: '0 12px', borderRadius: 999, border: `1px solid ${type === id ? T.primary500 : T.line200}`, background: type === id ? T.primary50 : RF.card, color: type === id ? T.primary700 : T.text700, fontSize: 12, fontWeight: 800, fontFamily: T.fontStack, whiteSpace: 'nowrap', cursor: 'pointer' }}>{label}</button>)}
          </div>
        </div>
        <div style={{ position: 'absolute', top: 172, left: 0, right: 0, bottom: 88, overflow: 'auto' }}>
          {source === 'loading' && <div role="status" style={{ margin: '0 20px 10px', padding: '9px 11px', borderRadius: 10, background: T.bgSubtle, color: T.text500, fontSize: 11.5 }}>불러오는 중이에요…</div>}
          {source === 'error' && <div role="status" style={{ margin: '0 20px 10px', padding: '9px 11px', borderRadius: 10, background: T.warningBg, color: T.warningText, fontSize: 11.5, lineHeight: '17px' }}>불러오지 못했어요. <button type="button" onClick={loadPlaces} style={{ padding: 0, border: 0, background: 'transparent', color: 'inherit', fontWeight: 900, textDecoration: 'underline', cursor: 'pointer' }}>다시 시도</button></div>}
          {source === 'live' && !visible.length && <div role="status" style={{ padding: '28px 20px', textAlign: 'center', fontSize: 12.5, color: T.text500 }}>검색 결과가 없어요</div>}
          {/* "지도에서 보기" — 목록이 이미 들고 있는 TourAPI 좌표를 실지도 순번 마커로 올린다.
              안드로이드 KakaoMapView 블록과 같다. 좌표가 하나도 없으면 지도를 그리지 않는다(R4). */}
          {showsMap && mapMarkers.length > 0 && (
            <div data-testid="place-search-map" style={{ margin: '0 20px 10px', borderRadius: 12, overflow: 'hidden' }}>
              <MiniMap height={150} markers={mapMarkers}/>
            </div>
          )}
          {/* 서버 목록은 정렬 기준(근처순 등)을 내려주지 않아 건수만 적는다 */}
          {source === 'live' && visible.length > 0 && <div style={{ padding: '0 20px 6px', fontSize: 11.5, color: T.text500 }}>{visibleCount}곳</div>}
          {visible.map((place) =><div key={place.contentId} style={{ width: '100%', display: 'flex', alignItems: 'stretch', borderBottom: `1px solid ${RF.softLine}`, paddingRight: 20 }}>
            <button type="button" onClick={() => openDetail(place.contentId)} style={{ flex: 1, minWidth: 0, display: 'flex', gap: 12, padding: '12px 10px 12px 20px', border: 0, background: 'transparent', color: T.text900, textAlign: 'left', fontFamily: T.fontStack, cursor: 'pointer' }}>
              <span style={{ width: 76, height: 68, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}><PlaceImage src={place.thumbnailUrl} hue={place.hue} height={68}/></span>
              <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><b style={{ fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.title}</b><PlaceTypeBadge type={place.type} label={typeNames.get(place.contentTypeId)}/></span><span style={{ display: 'block', marginTop: 4, fontSize: 11.5, lineHeight: '17px', color: T.text500 }}>{place.address}</span>{/* 주소 줄이 바로 위에 있다 — 좌표까지 보여줄 이유가 없다(기획에도 없다). */}</span>
            </button>
            <button type="button" onClick={() => nav.go('custom-course')} aria-label={`${place.title} 코스에 담기`} style={{ alignSelf: 'center', width: 32, height: 32, padding: 0, borderRadius: 999, border: `1px solid ${T.primary500}`, background: T.primary50, display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Icon name="plus" size={16} color={T.primary600}/></button>
          </div>)}
          <p style={{ padding: '12px 20px 24px', margin: 0, fontSize: 11, lineHeight: '17px', color: T.text400 }}>목록에는 제목·주소·썸네일·좌표만 보여요. 전화번호와 소개는 상세에서 확인할 수 있어요.</p>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 24px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ flex: 1 }}/><Btn variant="primary" onClick={() => nav.go('custom-course')}>코스에 반영</Btn></div>
      </div>
    </Phone>
  );
}

function ScreenPlaceDetail() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const [tab, setTab] = React.useState('photo');
  // 어떤 장소를 열지 정해지지 않았으면 보여줄 근거가 없다 — 표본 상세로 채우지 않는다.
  const selectedId = new URLSearchParams(window.location.search).get('contentId')
    || window.sessionStorage?.getItem('moyeo.selectedTourismContentId')
    || '';
  const [place, setPlace] = React.useState(null);
  const [source, setSource] = React.useState(selectedId ? 'loading' : 'error');
  const loadDetail = React.useCallback(async () => {
    if (!selectedId) return;
    setSource('loading');
    try {
      setPlace(await window.MoyeoTourism.detail(selectedId));
      setSource('live');
    } catch (_) {
      setPlace(null);
      setSource('error');
    }
  }, [selectedId]);
  React.useEffect(() => { loadDetail(); }, [loadDetail]);
  // 상세를 못 받은 화면은 헤더와 상태 문구만 남긴다. 사진·주소 칸을 비워 두면
  // "정보가 없는 장소"처럼 읽혀 실제 데이터와 구분되지 않는다.
  if (!place) {
    return (
      <Phone>
        <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
          <Header title="방문지" left center onBack={nav.back}/>
          <div role="status" style={{ padding: '40px 20px', textAlign: 'center', fontSize: 12.5, lineHeight: '20px', color: T.text500 }}>
            {source === 'loading' ? '불러오는 중이에요…' : <>불러오지 못했어요. {selectedId ? <button type="button" onClick={loadDetail} style={{ padding: 0, border: 0, background: 'transparent', color: T.primary600, fontWeight: 900, fontFamily: T.fontStack, fontSize: 12.5, textDecoration: 'underline', cursor: 'pointer' }}>다시 시도</button> : null}</>}
          </div>
        </div>
      </Phone>
    );
  }
  const current = place;
  // 서버가 사진을 안 준 장소는 빈 칸으로 채우지 않는다 — 자리표시자가 사진인 척하면 안 된다.
  const photoImages = current.images || [];
  const menuImages = current.menuImages || [];
  // 서버가 null 로 주는 줄(우편번호·전화번호·홈페이지)은 표기를 숨긴다 — 안내 문구로 채우지 않는다.
  // homepage 는 TourAPI 앵커 태그라 tourism-api 가 URL 만 뽑아 준다(파싱 실패 시 빈 값 → 숨김).
  const infoRows = [
    current.address ? ['pin', current.address, current.postalCode ? `우편번호 ${current.postalCode}` : ''] : null,
    current.phoneNumber ? ['phone', current.phoneNumber, current.phoneName || ''] : null,
    // 좌표가 있을 때만 그리되 **보여주는 것은 동작 문구**다 — iOS 와 같은 처리.
    // 예전에는 `35.8057438292, 129.5015858398` 처럼 소수점 10자리가 그대로 보였다.
    ['map', current.latitude != null && current.longitude != null ? '지도에서 열기' : null, null],
    current.homepage ? ['share', current.homepage, '홈페이지'] : null,
  ].filter(Boolean);
  // 공유는 iOS `ShareLink` 와 같은 내용을 보낸다. Web Share API 가 없으면 클립보드로 떨어진다.
  const sharePlace = async () => {
    const text = [current.title, current.address, current.homepage].filter(Boolean).join('\n');
    try {
      if (navigator.share) await navigator.share({ title: current.title, text });
      else await navigator.clipboard?.writeText(text);
    } catch (_) { /* 사용자가 취소했거나 권한이 없다 — 조용히 넘긴다 */ }
  };
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, position: 'relative' }}>
        {/* HERO-SCROLL-CANON R2 — 히어로까지 함께 스크롤된다(2쪽에 이미지가 남으면 위반).
            첫 화면 모양(R1: 카드가 이미지 위로 겹침)과 `1/N` 배지 위치(R1-1: 우측 하단)는
            웹이 정본이라 그대로 두고, 스크롤 컨테이너만 이미지 위로 올렸다.
            하단 CTA 는 계속 고정이다. */}
        <div data-testid="place-detail-scroll" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 88, overflow: 'auto' }}>
        <div style={{ position: 'relative' }}><PlaceImage src={current.images?.[0] || current.thumbnailUrl} hue={current.hue} height={232} overlay shape="landscape"/><span style={{ position: 'absolute', right: 18, bottom: 14, padding: '5px 9px', borderRadius: 999, background: 'rgba(0,0,0,.58)', color: '#fff', fontSize: 11, fontWeight: 800 }}>1 / {Math.max(1, current.images?.length || 1)}</span></div>
        {/* 이미지 아래 20px 을 덮어 올라오는 카드 — 예전 top: 212 절대 배치와 같은 위치다. */}
        <div style={{ position: 'relative', marginTop: -20, minHeight: 'calc(100% - 212px)', borderRadius: '20px 20px 0 0', background: RF.bg, padding: '18px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><h1 style={{ flex: 1, margin: 0, fontSize: 19, lineHeight: '26px' }}>{current.title}</h1><PlaceTypeBadge type={current.type}/></div>
          <div style={{ marginTop: 14, padding: 14, display: 'grid', gap: 11, borderRadius: 12, border: `1px solid ${RF.softLine}`, background: RF.card }}>
            {infoRows.map((row) => <div key={`${row[0]}-${row[1]}`} style={{ display: 'flex', gap: 10 }}><Icon name={row[0]} size={16} color={T.text500}/><span><b style={{ display: 'block', fontSize: 12.5, wordBreak: 'break-all' }}>{row[1]}</b>{row[2] ? <span style={{ display: 'block', marginTop: 2, fontSize: 10.5, color: T.text500 }}>{row[2]}</span> : null}</span></div>)}
          </div>
          <h2 style={{ margin: '20px 0 8px', fontSize: 13 }}>소개</h2><p style={{ margin: 0, fontSize: 12.5, lineHeight: '20px', color: T.text700 }}>{current.description || '상세 소개가 제공되지 않았어요.'}</p>
          <div role="tablist" aria-label="장소 이미지" style={{ display: 'flex', gap: 18, marginTop: 20, borderBottom: `1px solid ${RF.softLine}` }}>{[
            ['photo', `사진 ${current.images?.length || 0}`],
            ...(current.type === 'food' ? [['menu', `메뉴판 ${menuImages.length}`]] : []),
          ].map(([id,label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} style={{ padding: '0 0 9px', border: 0, borderBottom: tab === id ? `2px solid ${T.primary500}` : '2px solid transparent', background: 'transparent', color: tab === id ? T.primary600 : T.text500, fontWeight: 800, fontFamily: T.fontStack, cursor: 'pointer' }}>{label}</button>)}</div>
          <div style={{ display: 'grid', gridTemplateColumns: tab === 'photo' ? 'repeat(3,1fr)' : 'repeat(2,1fr)', gap: 7, marginTop: 12 }}>{(tab === 'photo' ? photoImages : menuImages).map((item, index) => <div key={`${tab}-${item || index}`} style={{ overflow: 'hidden', borderRadius: 8, border: `1px solid ${RF.softLine}` }}><PlaceImage src={item} hue={index % 2 ? 'pebble' : current.hue} height={tab === 'photo' ? 78 : 88}/></div>)}</div>
          {current.type === 'food' && <p style={{ margin: '14px 0 0', fontSize: 11, lineHeight: '17px', color: T.text400 }}>메뉴판 탭은 음식점 콘텐츠에서만 보여요.</p>}
        </div>
        </div>
        {/* 머리 줄은 **반투명 고정**이다 — 스크롤을 내려도 뒤로·공유가 남는다.
            예전에는 뒤로 버튼을 히어로 이미지 위에 절대 배치해서 이미지와 함께 올라가 버렸고,
            2쪽에서는 돌아갈 길이 화면에 없었다 (17-1b, 사용자 지적 2026-09-09).
            앱 둘은 「방문지 상세」 제목이 있는 고정 머리 줄을 둔다 — 같은 자리·같은 문구로 맞춘다. */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 56, zIndex: 3,
          display: 'flex', alignItems: 'center', padding: '0 12px',
          background: 'rgba(11,17,14,.62)', backdropFilter: 'blur(12px)',
        }}>
          <IconButton name="back" onClick={nav.back} bg={T.overlayPanel}/>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>방문지 상세</div>
          <IconButton name="share" onClick={sharePlace} bg={T.overlayPanel}/>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 24px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8 }}><Btn variant="ghost" onClick={nav.back}>목록으로</Btn><div style={{ flex: 1 }}><Btn variant="primary" full icon="plus" onClick={() => nav.go('custom-course')}>이 장소를 코스에 담기</Btn></div></div>
      </div>
    </Phone>
  );
}

const TERMS_DOCUMENTS = {
  service: { title: '이용약관', required: true, version: 'v1.2', date: '2026년 5월 1일 시행', summary: '모여트립을 쓰면서 지켜야 할 것과, 우리가 약속하는 것을 적었어요.', sections: [
    ['제1조 (목적)', '이 약관은 모여트립 in 경북(이하 “서비스”)이 제공하는 경상북도 여행 코스 기반 동행 매칭 서비스의 이용 조건과 절차, 회사와 회원의 권리·의무를 정하는 것을 목적으로 합니다.'],
    ['제2조 (용어의 정의)', '“모집”이란 회원이 특정 코스로 함께 떠날 동행을 구하는 게시물을 말합니다. “캠프”란 최소 인원이 충족되어 자동으로 열리는 채팅방을 말합니다. “호스트”란 모집을 개설한 회원을, “게스트”란 해당 모집에 참여한 회원을 말합니다.'],
    ['제3조 (모집의 성립과 소멸)', '모집은 마감일까지 최소 인원(3명)을 충족한 경우에만 확정됩니다. 마감일 기준 인원이 미달한 모집은 자동으로 소멸하며, 이 경우 회원에게 별도의 책임이 발생하지 않습니다.'],
    ['제4조 (여행 중 발생하는 사항)', '회사는 회원 간의 만남을 매개할 뿐, 여행 중 발생하는 이동·숙박·식음 등의 계약 당사자가 아닙니다. 여행 비용은 회원 간에 직접 정산하며, 서비스 내 정산 기능은 기록용 메모입니다.'],
    ['제5조 (금지 행위)', '타인을 사칭하거나, 금전 거래를 유도하거나, 성적·차별적 표현으로 다른 회원에게 불쾌감을 주는 행위를 금지합니다. 위반 시 이용이 제한될 수 있습니다.'],
    ['제6조 (계정과 닉네임)', '가입 시 선택한 닉네임과 캐릭터는 도감 기록의 동일성을 위해 변경되지 않습니다. 다만 회사는 서비스 정착 이후 정책을 변경할 수 있으며, 변경 시 사전에 공지합니다.'],
  ] },
  privacy: { title: '개인정보 처리방침', required: true, version: 'v1.4', date: '2026년 7월 10일 시행', summary: '어떤 정보를 왜 받고, 얼마나 보관하는지 적었어요.', sections: [
    ['수집하는 정보', '가입 시 소셜 로그인 식별자, 생년(나이대), 성별을 받습니다. 실명·연락처는 받지 않습니다. 서비스 이용 과정에서 작성한 모집·채팅·피드 내용과 접속 기록이 저장됩니다.'],
    ['이용 목적', '동행 매칭(나이대·성별 조건 확인), 안전한 이용 환경 유지(신고·차단 처리), 서비스 개선을 위한 통계 분석에 사용합니다.'],
    ['다른 회원에게 보이는 정보', '닉네임·캐릭터·나이대·성별·매너 점수·여행 횟수가 공개됩니다. 생년월일과 로그인 계정 정보는 공개되지 않습니다.'],
    ['보관 기간', '탈퇴 시 30일간 보관 후 완전히 삭제합니다. 다만 신고·분쟁 처리 이력은 관련 법령이 정한 기간 동안 별도 보관합니다.'],
    ['위탁 및 제3자 제공', '지도·관광정보 표시를 위해 한국관광공사 OpenAPI 등 외부 서비스를 이용하며, 이 과정에서 회원의 개인정보를 전달하지 않습니다.'],
  ] },
  location: { title: '위치정보 이용 동의', required: false, version: 'v1.0', date: '2026년 5월 1일 시행', summary: '켜지 않아도 서비스를 쓸 수 있어요. 켜면 근처 모집을 먼저 보여드려요.', sections: [
    ['이용 목적', '현재 위치 기준 30km 이내에서 오늘 출발하는 모집을 홈 상단에 보여주고, 집합 장소까지의 길 찾기를 제공합니다.'],
    ['동의를 거부할 경우', '근처 모집 추천과 길 찾기만 제한되고, 그 외 기능은 모두 동일하게 이용할 수 있습니다.'],
  ] },
  marketing: { title: '마케팅 정보 수신 동의', required: false, version: 'v1.0', date: '2026년 5월 1일 시행', summary: '새 코스나 이벤트 소식을 받아볼지 정하는 항목이에요.', sections: [
    ['보내는 내용', '계절별 신규 코스 소개, 지역 축제 일정, 이벤트 안내를 앱 푸시로 보냅니다.'],
    ['보내지 않는 것', '모집 승인·채팅·마감 임박처럼 이용에 꼭 필요한 알림은 이 동의와 무관하게 발송됩니다.'],
    ['철회 방법', '설정 › 알림에서 언제든 끌 수 있고, 끄더라도 서비스 이용에는 아무런 제한이 없습니다.'],
  ] },
};

// 서버 약관 content(마크다운)를 [섹션 제목, 본문] 배열로 바꾼다. '#' 문서 제목은 건너뛴다.
// 서버 약관은 표를 포함한 마크다운이다. 줄을 그대로 이어 그리면
// `| 구분 | 수집 항목 |` 과 구분선(`|---|`)이 본문에 그대로 노출된다.
// 지원 범위는 서버 약관이 실제로 쓰는 것에 맞춘다 — 제목·문단·표·글머리·번호 목록.
function parseTermMarkdown(content) {
  const blocks = [];
  let paragraph = [];
  let bullets = [];
  let ordered = [];
  let tableRows = [];
  const flushParagraph = () => { if (paragraph.length) { blocks.push({ kind: 'p', text: paragraph.join(' ') }); paragraph = []; } };
  const flushBullets = () => { if (bullets.length) { blocks.push({ kind: 'ul', items: bullets }); bullets = []; } };
  const flushOrdered = () => { if (ordered.length) { blocks.push({ kind: 'ol', items: ordered }); ordered = []; } };
  const flushTable = () => {
    if (!tableRows.length) return;
    blocks.push({ kind: 'table', header: tableRows[0], rows: tableRows.slice(1) });
    tableRows = [];
  };
  const flushAll = () => { flushParagraph(); flushBullets(); flushOrdered(); flushTable(); };
  const cells = (line) => line.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
  const isSeparator = (line) => line.startsWith('|') && line.includes('-') && !line.replace(/[\s|:-]/g, '');

  String(content || '').split('\n').forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) { flushAll(); return; }
    if (isSeparator(line)) return;
    if (line.startsWith('|')) { flushParagraph(); flushBullets(); flushOrdered(); tableRows.push(cells(line)); return; }
    flushTable();
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph(); flushBullets(); flushOrdered();
      blocks.push({ kind: 'h', level: heading[1].length, text: heading[2].trim() });
      return;
    }
    const bullet = /^[-*•]\s+(.*)$/.exec(line);
    if (bullet) { flushParagraph(); flushOrdered(); bullets.push(bullet[1].trim()); return; }
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (numbered) { flushParagraph(); flushBullets(); ordered.push(numbered[1].trim()); return; }
    flushBullets(); flushOrdered();
    paragraph.push(line);
  });
  flushAll();
  return blocks;
}

// 표는 좁은 화면에서 글자를 줄이지 않고 가로로 스크롤한다 (개인정보 동의 표가 4열이다).
function TermMarkdown({ blocks }) {
  const cellStyle = { padding: '9px 10px', fontSize: 12, lineHeight: '18px', color: T.text700, borderBottom: `1px solid ${RF.softLine}`, borderRight: `1px solid ${RF.softLine}`, verticalAlign: 'top', minWidth: 116 };
  return blocks.map((block, index) => {
    const key = `${block.kind}-${index}`;
    if (block.kind === 'h') {
      const size = block.level === 1 ? 15 : block.level === 2 ? 13.5 : 12.5;
      return <h2 key={key} style={{ margin: index ? '18px 0 0' : 0, fontSize: size, color: T.text900 }}>{block.text}</h2>;
    }
    if (block.kind === 'ul' || block.kind === 'ol') {
      const Tag = block.kind === 'ul' ? 'ul' : 'ol';
      return <Tag key={key} style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12.5, lineHeight: '21px', color: T.text700 }}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</Tag>;
    }
    if (block.kind === 'table') {
      return <div key={key} style={{ marginTop: 10, overflowX: 'auto', border: `1px solid ${RF.softLine}`, borderRadius: 10 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead><tr>{block.header.map((cell, cellIndex) => <th key={cellIndex} scope="col" style={{ ...cellStyle, color: T.text900, fontWeight: 700, background: T.bgSubtle, whiteSpace: 'nowrap' }}>{cell}</th>)}</tr></thead>
          <tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>{block.header.map((_, cellIndex) => <td key={cellIndex} style={cellStyle}>{row[cellIndex] || ''}</td>)}</tr>)}</tbody>
        </table>
      </div>;
    }
    return <p key={key} style={{ margin: '8px 0 0', fontSize: 12.5, lineHeight: '21px', color: T.text700 }}>{block.text}</p>;
  });
}

function ScreenTermsDetail({ doc = 'service', from = 'signup' }) {
  const nav = window.useNav ? window.useNav() : { back: () => {}, params: {} };
  const current = TERMS_DOCUMENTS[doc];
  // 약관 화면에서 넘겨준 termId 가 있으면 그 ID 로 바로 받는다 — 제목 키워드로 찾지 않는다.
  // 서버가 약관을 새로 추가해도 키워드 표에 없다는 이유로 본문을 못 여는 일이 없어야 한다.
  const requestedTermId = (nav.params || {}).termId;
  const [serverTerm, setServerTerm] = React.useState(null);
  React.useEffect(() => {
    let active = true;
    const keywords = { service: '이용약관', privacy: '개인정보', location: '위치정보', marketing: '마케팅' };
    // 약관은 공개 엔드포인트다 — 가입 중(세션 없음)에도 본문을 받아야 한다.
    const resolve = requestedTermId
      ? window.MoyeoApi.termDetail(requestedTermId)
      : window.MoyeoApi.terms().then((list) => {
        const match = (Array.isArray(list) ? list : []).find((term) => String(term.title || '').includes(keywords[doc]));
        return match ? window.MoyeoApi.termDetail(match.termId) : null;
      });
    resolve
      .then((detail) => { if (active && detail?.content) setServerTerm(detail); })
      .catch(() => { /* 실패 시 번들 문서를 유지한다 — 없는 내용을 지어내지 않는다 */ });
    return () => { active = false; };
  }, [requestedTermId, doc]);
  const serverBlocks = serverTerm ? parseTermMarkdown(serverTerm.content) : null;
  const required = serverTerm ? serverTerm.required : current.required;
  // 공유 버튼이 눌러도 아무 일도 없던 자리다. Web Share API 가 없으면 클립보드로 떨어진다.
  const shareTerm = async () => {
    const title = serverTerm ? serverTerm.title : current.title;
    const body = serverTerm
      ? serverTerm.content
      : current.sections.map(([sectionTitle, sectionBody]) => `## ${sectionTitle}\n\n${sectionBody}`).join('\n\n');
    const text = `${title}\n\n${body}`;
    try {
      if (navigator.share) await navigator.share({ title, text });
      else await navigator.clipboard?.writeText(text);
    } catch (_) { /* 사용자가 취소했거나 권한이 없다 — 조용히 넘긴다 */ }
  };
  return <Phone><div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
    <Header title={serverTerm ? serverTerm.title : current.title} left center onBack={nav.back} right={<IconButton name="share" onClick={shareTerm}/>}/>
    <main style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: from === 'signup' ? 96 : 0, overflow: 'auto', padding: '6px 20px 24px' }}>
      <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}><Chip variant={required ? 'soft' : 'neutral'}>{required ? '필수' : '선택'}</Chip><span style={{ fontSize: 11.5, color: T.text500 }}>{serverTerm ? `${serverTerm.version} 시행` : `${current.version} · ${current.date}`}</span></div>
      {/* 서버 약관에는 요약문이 없어 로그인 상태에서는 요약 블록을 생략한다 */}
      {!serverTerm && <div style={{ marginTop: 12, padding: 13, borderRadius: 12, background: T.bgSubtle, border: `1px solid ${RF.softLine}`, fontSize: 12.5, lineHeight: '19px', color: T.text700 }}>{current.summary}</div>}
      {serverBlocks
        ? <div style={{ marginTop: 18 }}><TermMarkdown blocks={serverBlocks}/></div>
        : current.sections.map(([title, body]) => <section key={title || body.slice(0, 20)} style={{ marginTop: 22 }}>{title && <h2 style={{ margin: 0, fontSize: 13.5 }}>{title}</h2>}<p style={{ margin: '8px 0 0', fontSize: 12.5, lineHeight: '21px', color: T.text700, whiteSpace: 'pre-line' }}>{body}</p></section>)}
      <p style={{ margin: '26px 0 0', paddingTop: 16, borderTop: `1px solid ${RF.softLine}`, fontSize: 11.5, lineHeight: '18px', color: T.text500 }}>이전 판본은 <b>설정 › 이용약관 › 지난 버전</b>에서 볼 수 있어요. 약관이 바뀌면 시행 7일 전에 공지와 푸시로 알려드려요.</p>
    </main>
    {from === 'signup' && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8 }}><Btn variant="ghost" onClick={nav.back}>닫기</Btn><div style={{ flex: 1 }}><Btn variant="primary" full onClick={nav.back}>{required ? '동의하고 돌아가기' : '이 항목에 동의하기'}</Btn></div></div>}
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
