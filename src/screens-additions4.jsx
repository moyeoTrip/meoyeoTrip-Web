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
  // 건수는 **화면에 실제로 그린 만큼**만 센다. 이 화면은 30건 한 페이지가 전부인데
  // 서버 `totalElements`(예: 412)를 적으면 「412곳」이라 해 놓고 30개만 보여 주게 된다 —
  // 숫자와 목록이 어긋나고, 나머지를 볼 길도 없다 (QA PLACE-015).
  // 더 있으면 그 사실을 따로 한 줄로 알린다(아래 `moreThanShown`).
  const visibleCount = visible.length;
  const moreThanShown = total != null && total > visible.length ? total - visible.length : 0;
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
          {source === 'live' && visible.length > 0 && (
            <div style={{ padding: '0 20px 6px', fontSize: 11.5, color: T.text500 }}>
              {visibleCount}곳{moreThanShown > 0 ? ` · 검색어를 좁히면 나머지 ${moreThanShown}곳도 찾을 수 있어요` : ''}
            </div>
          )}
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
  // 2026-09-15 결정 ⑬ — 외부 공유 진입점을 뺐다. 공개 URL 규격이 정해진 적이 없어
  // 공유 본문에 링크가 한 줄도 없었다(QA EXTRA-003) — 받는 사람이 아무 데도 갈 수 없다.
  // 「준비 중」 안내로 바꾸지 않고 **버튼 자체를 없앤다**. 규격이 서면 그때 되살린다.
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
          <h2 style={{ margin: '20px 0 8px', fontSize: 13 }}>소개</h2><p style={{ margin: 0, fontSize: 12.5, lineHeight: '20px', color: T.text700, whiteSpace: 'pre-line' }}>{current.description || '상세 소개가 제공되지 않았어요.'}</p>
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
          {/* 공유 버튼이 있던 자리. 비워 두되 **폭은 남긴다** — 없애면 제목이 왼쪽으로 밀려
              뒤로 버튼과 가운데 정렬이 어긋난다 (결정 ⑬). */}
          <span aria-hidden="true" style={{ width: 36, height: 36 }}/>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 24px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8 }}><Btn variant="ghost" onClick={nav.back}>목록으로</Btn><div style={{ flex: 1 }}><Btn variant="primary" full icon="plus" onClick={() => nav.go('custom-course')}>이 장소를 코스에 담기</Btn></div></div>
      </div>
    </Phone>
  );
}

// 약관 본문·제목·버전은 **전부 서버 원장**에서 온다. 번들 사본은 지웠다 —
// 사본이 원장과 다른 말을 하고 있었다(사본 「탈퇴 시 30일 보관 후 삭제」 / 원장 「탈퇴 시 지체 없이 파기」).
// 법적 고지가 두 곳에서 어긋나면 어느 쪽이 정본인지 사용자도 우리도 알 수 없다.
//
// 종류는 `code` 로 가리킨다. `termId` 는 판본이 바뀔 때마다 새로 발급돼 종류를 가리킬 수 없고,
// 제목에 '개인정보'가 들어 있는지로 찾던 방식은 **처리방침 자리에 가입 동의서를 열었다** (QA BE-03).
//
// 아래 표는 **화면(네비게이션) 이름**이지 약관 제목이 아니다 — 설정 목록 행과 같은 말이어야 하고,
// 본문을 받기 전(로딩·실패)에도 헤더에 무언가는 적혀 있어야 한다. 본문을 받으면 서버 `title` 로 덮는다.
const TERM_SCREEN_LABEL = {
  SERVICE: '이용약관',
  PRIVACY_COLLECTION: '개인정보 수집·이용 동의',
  PRIVACY_POLICY: '개인정보 처리방침',
  MARKETING: '마케팅 정보 수신 동의',
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

// 인라인 강조(`**굵게**`). 서버 약관 본문이 실제로 쓴다 —
// 개인정보 처리방침에 「**위치정보를 수집하지 않습니다.**」·「**회원 탈퇴 시 지체 없이 파기**」·
// 「**제3자에게 제공하지 않습니다.**」 세 군데가 있고, 별표가 **화면에 그대로 노출되고 있었다**
// (2026-09-14 브라우저 확인). 강조하려던 문장이 오히려 읽기 어려워지는 자리라 여기서 푼다.
// 지원 범위는 서버 약관이 실제로 쓰는 `**…**` 하나뿐이다 — 쓰지 않는 문법을 지어내지 않는다.
function termInline(text) {
  const source = String(text ?? '');
  if (!source.includes('**')) return source;
  const parts = source.split(/\*\*([^*]+)\*\*/g);
  // split 의 홀수 번째가 캡처한 강조 구간이다.
  return parts.map((part, index) => (index % 2 === 1
    ? <b key={index} style={{ fontWeight: 800, color: T.text900 }}>{part}</b>
    : part));
}

// 표는 좁은 화면에서 글자를 줄이지 않고 가로로 스크롤한다 (개인정보 동의 표가 4열이다).
function TermMarkdown({ blocks }) {
  const cellStyle = { padding: '9px 10px', fontSize: 12, lineHeight: '18px', color: T.text700, borderBottom: `1px solid ${RF.softLine}`, borderRight: `1px solid ${RF.softLine}`, verticalAlign: 'top', minWidth: 116 };
  return blocks.map((block, index) => {
    const key = `${block.kind}-${index}`;
    if (block.kind === 'h') {
      const size = block.level === 1 ? 15 : block.level === 2 ? 13.5 : 12.5;
      return <h2 key={key} style={{ margin: index ? '18px 0 0' : 0, fontSize: size, color: T.text900 }}>{termInline(block.text)}</h2>;
    }
    if (block.kind === 'ul' || block.kind === 'ol') {
      const Tag = block.kind === 'ul' ? 'ul' : 'ol';
      return <Tag key={key} style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12.5, lineHeight: '21px', color: T.text700 }}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{termInline(item)}</li>)}</Tag>;
    }
    if (block.kind === 'table') {
      return <div key={key} style={{ marginTop: 10, overflowX: 'auto', border: `1px solid ${RF.softLine}`, borderRadius: 10 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead><tr>{block.header.map((cell, cellIndex) => <th key={cellIndex} scope="col" style={{ ...cellStyle, color: T.text900, fontWeight: 700, background: T.bgSubtle, whiteSpace: 'nowrap' }}>{termInline(cell)}</th>)}</tr></thead>
          <tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>{block.header.map((_, cellIndex) => <td key={cellIndex} style={cellStyle}>{termInline(row[cellIndex] || '')}</td>)}</tr>)}</tbody>
        </table>
      </div>;
    }
    return <p key={key} style={{ margin: '8px 0 0', fontSize: 12.5, lineHeight: '21px', color: T.text700 }}>{termInline(block.text)}</p>;
  });
}

function ScreenTermsDetail({ code: codeProp = 'SERVICE', from: fromProp = 'signup' }) {
  const nav = window.useNav ? window.useNav() : { back: () => {}, go: () => {}, params: {} };
  // 가입 약관 목록에서 눌러 들어오면 그 판본의 termId 가 실려 온다 — 사용자가 **본 그 판본**에 동의해야 한다.
  // 설정에서 열 때는 termId 를 알 수 없으므로 종류(code)로 현재 판본을 받는다.
  const requestedTermId = (nav.params || {}).termId;
  // 「지난 버전」 목록(terms-history)에서 들어오면 라우트가 `terms-detail` 하나라 props 로는
  // 종류를 알려줄 수 없다 — params 로 실어 보낸 code/from 을 props 보다 우선한다.
  // 이게 없으면 처리방침의 판본을 눌렀는데 헤더·`data-term-code` 가 이용약관으로 찍힌다.
  const code = (nav.params || {}).code || codeProp;
  const from = (nav.params || {}).from || fromProp;
  const [term, setTerm] = React.useState(null);
  // 'loading' | 'ready' | 'empty' | 'error' — 네 상태를 구분한다. 예전에는 실패도 성공도 아닌 채로
  // 번들 사본이 아무 말 없이 정본처럼 그려졌다 (W-86 / 안드 AND-20).
  const [state, setState] = React.useState('loading');
  const [error, setError] = React.useState('');
  const [reloadKey, setReloadKey] = React.useState(0);
  React.useEffect(() => {
    let active = true;
    setState('loading');
    setError('');
    // 약관은 공개 엔드포인트다 — 가입 중(세션 없음)에도 본문을 받아야 한다.
    const resolve = requestedTermId
      ? window.MoyeoApi.termDetail(requestedTermId)
      : window.MoyeoApi.termLatest(code);
    resolve
      .then((detail) => {
        if (!active) return;
        if (detail && String(detail.content || '').trim()) { setTerm(detail); setState('ready'); }
        else { setTerm(null); setState('empty'); }
      })
      .catch((requestError) => {
        if (!active) return;
        setTerm(null);
        setError(window.userFacingError(requestError, '약관을 불러오지 못했어요.'));
        setState('error');
      });
    return () => { active = false; };
  }, [requestedTermId, code, reloadKey]);
  const retry = () => setReloadKey((value) => value + 1);
  const title = term ? term.title : (TERM_SCREEN_LABEL[code] || '약관');
  // 2026-09-15 결정 ⑬ — 약관 상세의 외부 공유 버튼도 뺐다(공개 URL 규격 없음). 자리째 없앤다.
  // 「동의하고 돌아가기」가 **닫기와 똑같이 되돌아가기만 했다** — 사용자는 동의했다고 믿는데
  // 앞 화면 체크박스가 그대로 비어 있고, 가입 버튼이 계속 잠겨 있었다 (2026-09-12 감사).
  // iOS·안드로이드는 `onAgree` 콜백으로 앞 화면에 알린다. 웹은 화면이 라우트로 갈라져 있어
  // 창 이벤트로 알리고, 앞 화면이 언마운트돼 있었더라도 다시 붙을 때 주워 가도록 전역에도 남긴다.
  const agreeAndBack = () => {
    const termId = term ? term.termId : requestedTermId;
    if (termId != null) {
      const agreed = window.__moyeoAgreedTermIds instanceof Set ? window.__moyeoAgreedTermIds : new Set();
      agreed.add(termId);
      window.__moyeoAgreedTermIds = agreed;
      window.dispatchEvent(new CustomEvent('moyeo:term-agreed', { detail: { termId } }));
    }
    nav.back();
  };
  const noticeStyle = { marginTop: 12, padding: 13, borderRadius: 12, background: T.bgSubtle, border: `1px solid ${RF.softLine}`, fontSize: 12.5, lineHeight: '19px', color: T.text900 };
  const retryButton = <button type="button" data-testid="terms-detail-retry" onClick={retry} disabled={state === 'loading'} style={{ display: 'block', marginTop: 10, height: 40, padding: '0 14px', borderRadius: 10, border: `1px solid ${RF.softLine}`, background: RF.card, color: T.primary600, fontSize: 13, fontWeight: 700, cursor: state === 'loading' ? 'default' : 'pointer' }}>{state === 'loading' ? '불러오는 중...' : '다시 시도'}</button>;

  return <Phone><div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
    <Header title={title} left center onBack={nav.back}/>
    {/* 어떤 종류의 약관을 보고 있는지 화면에 남긴다 — 테스트·QA 가 「처리방침 자리에 무엇이 열렸는지」를
        제목 문자열이 아니라 code 로 확인할 수 있어야 한다 (QA BE-03 이 제목 매칭에서 나왔다). */}
    <main data-testid="terms-detail-screen" data-term-code={code} data-term-state={state} style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: from === 'signup' ? 96 : 0, overflow: 'auto', padding: '6px 20px 24px' }}>
      {/* 필수·선택과 판본은 서버가 준 값만 쓴다. 받기 전에는 아무 말도 하지 않는다 —
          「필수」라고 먼저 적어 두면 서버가 선택이라고 해도 사용자는 필수로 읽고 지나간다. */}
      {state === 'ready' && <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}><Chip variant={term.required ? 'soft' : 'neutral'}>{term.required ? '필수' : '선택'}</Chip><span style={{ fontSize: 11.5, color: T.text500 }}>{term.version} 시행</span></div>}
      {state === 'loading' && <div role="status" data-testid="terms-detail-loading" style={noticeStyle}>약관을 불러오는 중이에요</div>}
      {/* 이 화면은 법적 문서다 — 무엇에 동의하는지 확정되지 않은 채로 동의를 받지 않는다 (W-86).
          네트워크가 없을 때 빈 화면이 남지 않도록 이유와 다시 받을 수단을 함께 준다. */}
      {state === 'error' && <div role="alert" data-testid="terms-detail-offline-notice" style={{ ...noticeStyle, border: `1px solid ${T.danger}` }}>
        약관을 불러오지 못했어요. 약관 본문은 서버에만 있어 지금은 보여드릴 수 없고, 동의도 받을 수 없어요.
        <div style={{ marginTop: 6, fontSize: 11.5, color: T.text500 }}>{error}</div>
        {retryButton}
      </div>}
      {state === 'empty' && <div role="alert" data-testid="terms-detail-empty" style={noticeStyle}>
        이 약관은 아직 등록되지 않았어요. 등록되면 바로 여기에서 보실 수 있어요.
        {retryButton}
      </div>}
      {state === 'ready' && <div style={{ marginTop: 18 }}><TermMarkdown blocks={parseTermMarkdown(term.content)}/></div>}
      {/* 2026-09-14 결정 ①: 「지난 버전」 줄. 서버가 주는 처리방침 본문이 「지난 판본은 약관 화면의
          "지난 버전"에서 보실 수 있습니다」라고 약속하는데 세 플랫폼 어디에도 그 화면이 없었다.
          API 는 이미 있었고(`GET /api/v1/terms/history/{code}`) 웹은 `termHistory` 정의까지 있으면서
          호출부가 0건이었다 (ROUND-2026-09-14-DECISIONS ①). */}
      <button
        type="button"
        data-testid="terms-detail-history"
        // `back` 은 params 를 되돌리지 않고 그대로 남긴다 — 돌아왔을 때 이 화면이 보던 판본을
        // 잃지 않도록 termId·from 도 함께 실어 보낸다.
        onClick={() => nav.go('terms-history', { params: { code, termId: requestedTermId, from } })}
        style={{
          width: '100%', marginTop: 22, height: 48, padding: '0 4px', border: 0, borderTop: `1px solid ${RF.softLine}`,
          background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: T.text900, fontFamily: T.fontStack, fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>
        지난 버전
        <Icon name="arrow" size={16} color={T.text400}/>
      </button>
      <p style={{ margin: '10px 0 0', fontSize: 11.5, lineHeight: '18px', color: T.text500 }}>약관이 바뀌면 시행 7일 전에 공지와 푸시로 알려드려요.</p>
    </main>
    {from === 'signup' && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 28px', background: RF.card, borderTop: `1px solid ${RF.softLine}`, display: 'flex', gap: 8 }}><Btn variant="ghost" onClick={nav.back}>닫기</Btn><div style={{ flex: 1 }}><Btn variant="primary" full disabled={state !== 'ready'} testId="terms-detail-agree" onClick={agreeAndBack}>{term && !term.required ? '이 항목에 동의하기' : '동의하고 돌아가기'}</Btn></div></div>}
  </div></Phone>;
}

// ───────── 약관 「지난 버전」 (판본 목록) ─────────
// `GET /api/v1/terms/history/{code}` — 인증 불필요. 응답은 **최신순**이고 비활성(지난) 판본도 포함한다.
// 본문은 `GET /api/v1/terms/{termId}` 인데 **지난 판본은 비활성이라 404 를 준다**(서버 현재 상태).
// 그래서 **현재 판본만 눌리는 모양**을 준다 — 항상 실패할 버튼을 두지 않는다
// (ROUND-2026-09-14-DECISIONS ①).
//
// 실서버 확인(2026-09-14): 네 종류 모두 200 이고 판본은 각각 **1건**이다
// (SERVICE 1 / PRIVACY_COLLECTION 2 / MARKETING 3 / PRIVACY_POLICY 21).
// **한 줄만 보이는 것이 정상이고 빈 상태가 아니다.**
function ScreenTermsHistory() {
  const nav = window.useNav ? window.useNav() : { back: () => {}, go: () => {}, params: {} };
  const code = (nav.params || {}).code || 'SERVICE';
  const [versions, setVersions] = React.useState([]);
  // 어느 판본이 「현재」인지는 목록만 보고 알 수 없다(응답에 활성 여부가 없다) —
  // 같은 code 의 현재 판본 termId 를 따로 받아 대조한다.
  const [currentTermId, setCurrentTermId] = React.useState(null);
  const [state, setState] = React.useState('loading');
  const [error, setError] = React.useState('');
  const [reloadKey, setReloadKey] = React.useState(0);
  React.useEffect(() => {
    let active = true;
    setState('loading');
    setError('');
    Promise.all([
      window.MoyeoApi.termHistory(code),
      // 현재 판본을 못 받아도 목록은 보여준다 — 「현재」 배지만 빠진다.
      window.MoyeoApi.termLatest(code).catch(() => null),
    ])
      .then(([history, latest]) => {
        if (!active) return;
        if (!Array.isArray(history)) { setVersions([]); setState('empty'); return; }
        setVersions(history);
        setCurrentTermId(latest?.termId ?? null);
        setState(history.length ? 'ready' : 'empty');
      })
      .catch((requestError) => {
        if (!active) return;
        setVersions([]);
        setError(window.userFacingError(requestError, '지난 버전을 불러오지 못했어요.'));
        setState('error');
      });
    return () => { active = false; };
  }, [code, reloadKey]);
  const noticeStyle = { marginTop: 12, padding: 13, borderRadius: 12, background: T.bgSubtle, border: `1px solid ${RF.softLine}`, fontSize: 12.5, lineHeight: '19px', color: T.text900 };

  return <Phone><div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
    <Header title="지난 버전" left center onBack={nav.back}/>
    <main data-testid="terms-history-screen" data-term-code={code} data-term-state={state} style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 0, overflow: 'auto', padding: '6px 20px 24px' }}>
      <div style={{ fontSize: 12.5, lineHeight: '19px', color: T.text500 }}>{TERM_SCREEN_LABEL[code] || '약관'}의 판본이에요. 최신 판본이 맨 위예요.</div>
      {state === 'loading' && <div role="status" data-testid="terms-history-loading" style={noticeStyle}>지난 버전을 불러오는 중이에요</div>}
      {state === 'error' && <div role="alert" data-testid="terms-history-error" style={{ ...noticeStyle, border: `1px solid ${T.danger}` }}>
        지난 버전을 불러오지 못했어요.
        <div style={{ marginTop: 6, fontSize: 11.5, color: T.text500 }}>{error}</div>
        <button type="button" data-testid="terms-history-retry" onClick={() => setReloadKey((value) => value + 1)} style={{ display: 'block', marginTop: 10, height: 40, padding: '0 14px', borderRadius: 10, border: `1px solid ${RF.softLine}`, background: RF.card, color: T.primary600, fontSize: 13, fontWeight: 700, fontFamily: T.fontStack, cursor: 'pointer' }}>다시 시도</button>
      </div>}
      {state === 'empty' && <div role="status" data-testid="terms-history-empty" style={noticeStyle}>아직 등록된 판본이 없어요.</div>}
      {state === 'ready' && <div data-testid="terms-history-list" style={{ marginTop: 14, borderRadius: 14, border: `1px solid ${RF.softLine}`, background: RF.card, overflow: 'hidden' }}>
        {versions.map((item, index) => {
          // 현재 판본만 본문이 열린다. 지난 판본은 서버가 404 를 주므로 **누를 수 없는 줄**로 둔다.
          const isCurrent = currentTermId != null && item.termId === currentTermId;
          const row = (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: T.text900 }}>{item.version}</span>
                  {isCurrent && <Chip variant="soft">현재</Chip>}
                </div>
                <div style={{ fontSize: 11.5, color: T.text500, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
              </div>
              {isCurrent
                ? <Icon name="arrow" size={16} color={T.text400}/>
                // 본문이 안 열리는 판본은 눌리는 모양을 주지 않는다 — 대신 왜 못 여는지 적는다.
                : <span style={{ fontSize: 11, color: T.text400, whiteSpace: 'nowrap' }}>본문 제공 종료</span>}
            </>
          );
          const rowStyle = {
            width: '100%', padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 10,
            borderTop: index === 0 ? 'none' : `1px solid ${T.line100}`, textAlign: 'left',
            background: 'transparent', fontFamily: T.fontStack,
          };
          return isCurrent ? (
            <button
              key={item.termId}
              type="button"
              data-testid={`terms-history-${item.termId}`}
              onClick={() => nav.go('terms-detail', { params: { termId: item.termId, code, from: 'settings' } })}
              style={{ ...rowStyle, border: 0, borderTop: rowStyle.borderTop, cursor: 'pointer' }}>
              {row}
            </button>
          ) : (
            <div key={item.termId} data-testid={`terms-history-${item.termId}`} style={rowStyle}>{row}</div>
          );
        })}
      </div>}
      {state === 'ready' && (
        <p style={{ margin: '14px 0 0', fontSize: 11.5, lineHeight: '18px', color: T.text500 }}>
          지난 판본의 본문은 지금은 보관만 하고 있어요. 현재 판본은 눌러서 전문을 보실 수 있어요.
        </p>
      )}
    </main>
  </div></Phone>;
}

// 가입 동의 3종 — 서버 `GET /api/v1/terms` 가 주는 동의 대상 문서와 같은 종류다.
function ScreenTermsPrivacy() { return <ScreenTermsDetail code="PRIVACY_COLLECTION"/>; }
function ScreenTermsMarketing() { return <ScreenTermsDetail code="MARKETING"/>; }
// 설정에서 여는 읽기 전용 3종. 설정 › 개인정보는 **처리방침**(PRIVACY_POLICY)이지
// 가입 때 받는 **수집·이용 동의서**(PRIVACY_COLLECTION)가 아니다 — 둘을 섞은 것이 QA BE-03 이었다.
function ScreenTermsSettings() { return <ScreenTermsDetail code="SERVICE" from="settings"/>; }
function ScreenPrivacySettings() { return <ScreenTermsDetail code="PRIVACY_POLICY" from="settings"/>; }
function ScreenMarketingSettings() { return <ScreenTermsDetail code="MARKETING" from="settings"/>; }

Object.assign(window, { PlaceTypeBadge, ScreenPlaceSearch, ScreenPlaceDetail, ScreenTermsDetail, ScreenTermsHistory, ScreenTermsPrivacy, ScreenTermsMarketing, ScreenTermsSettings, ScreenPrivacySettings, ScreenMarketingSettings });
