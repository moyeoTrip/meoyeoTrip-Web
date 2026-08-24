// ───────── 29-4 · 오픈소스 라이선스 / 29-4a · 라이선스 전문 (changeLog17) ─────────
//
// 앱이 실제로 배포하는 의존성을 고지하는 화면이다. 데이터는 `src/oss-licenses.js` 에 내장돼
// 서버 호출이 없고 오프라인에서도 열린다. 웹은 자기 플랫폼 항목(7건)만 보여준다 —
// 목록 항목이 플랫폼마다 다른 것이 정상이고, 캡처 대조 대상은 헤더 · 요약 문구 · 행 구조 ·
// 배지 위치 · 각주까지다(changeLog17 §2). 로그인·캡처 모드와 무관하게 같은 내용을 보여준다.

function ScreenOssLicenses() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const items = window.MoyeoOssLicenses?.items || [];
  const openDetail = (item) => {
    window.MoyeoOssLicenses?.select(item.name);
    nav.go('oss-license-detail');
  };
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="오픈소스 라이선스" left center onBack={nav.back}/>

        <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 0, overflow: 'auto', padding: '6px 20px 28px' }}>
          {/* 무엇을 보는 화면인지 먼저 — 약관 상세(08-x)와 같은 요약 박스 형식 */}
          <div style={{ padding: 13, borderRadius: 12, background: T.bgSubtle, border: `1px solid ${RF.softLine}`, fontSize: 12.5, lineHeight: '19px', color: T.text700 }}>
            모여트립은 아래 오픈소스 소프트웨어의 도움을 받아 만들었어요. 항목을 누르면 라이선스 전문을 볼 수 있어요.
            항목 구성은 플랫폼(iOS · Android · 웹)에 따라 달라요.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>사용 중인 오픈소스</div>
            <div style={{ fontSize: 11.5, color: T.text500, fontVariantNumeric: 'tabular-nums' }}>{items.length}개</div>
          </div>

          <div style={{ background: RF.card, border: `1px solid ${RF.softLine}`, borderRadius: 12, overflow: 'hidden' }}>
            {items.map((item, index) => (
              <div
                key={item.name}
                data-testid={`oss-license-${index}`}
                onClick={() => openDetail(item)}
                style={{
                  minHeight: 62, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                  borderTop: index === 0 ? 'none' : `1px solid ${RF.softLine}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: T.text900 }}>{item.name}</div>
                  <div style={{ fontSize: 11.5, color: T.text500, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>
                    {item.version} · {item.license}
                  </div>
                </div>
                <Icon name="arrow" size={16} color={T.text400}/>
              </div>
            ))}
          </div>

          {/* 오픈소스가 아닌 자체 배포 SDK가 섞여 있다는 사실을 감추지 않는다 */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${RF.softLine}`, fontSize: 11.5, color: T.text500, lineHeight: '18px' }}>
            오픈소스 라이선스가 아닌 자체 배포 SDK는 해당 사업자의 약관을 따라요.
            새 라이브러리를 추가하면 이 목록도 함께 갱신돼요.
          </div>
        </div>
      </div>
    </Phone>
  );
}

function ScreenOssLicenseDetail() {
  const nav = window.useNav ? window.useNav() : { go: () => {}, back: () => {} };
  const item = window.MoyeoOssLicenses?.selected() || null;
  const licenseText = item ? window.MoyeoOssLicenses?.licenseText(item) : null;
  // 전문이 없는 자체 배포 SDK는 라이선스 이름과 원문 URL만 보여준다 (전문을 지어내지 않는다).
  const lines = licenseText ? licenseText.split('\n') : [];
  return (
    <Phone>
      <div style={{ height: '100%', background: RF.bg, paddingTop: 46, position: 'relative' }}>
        <Header title="라이선스 전문" left center onBack={nav.back}/>

        <div style={{ position: 'absolute', top: 78, left: 0, right: 0, bottom: 0, overflow: 'auto', padding: '6px 20px 28px' }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: T.text900 }}>{item?.name || ''}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginTop: 9 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 9px', borderRadius: 999,
              background: T.bgSubtle, color: T.text700, border: `1px solid ${RF.softLine}`,
              fontSize: 11, fontWeight: 800, fontVariantNumeric: 'tabular-nums',
            }}>{item?.version || '-'}</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 9px', borderRadius: 999,
              background: T.primary50, color: T.primary700, border: `1px solid ${T.primary100}`,
              fontSize: 11, fontWeight: 800,
            }}>{item?.license || ''}</span>
          </div>

          <div style={{ marginTop: 14, fontSize: 11.5, color: T.text500, lineHeight: '18px', wordBreak: 'break-all' }}>
            원문 확인 · {item?.url || ''}
          </div>

          {lines.length > 0 && (
            <div data-testid="oss-license-text" style={{ marginTop: 16, padding: 14, borderRadius: 12, background: T.bgSubtle, border: `1px solid ${RF.softLine}` }}>
              {lines.map((line, index) => (
                <div
                  key={index}
                  style={{ fontSize: 11.5, lineHeight: '18px', color: line ? T.text700 : 'transparent', minHeight: line ? 'auto' : 9, whiteSpace: 'pre-wrap' }}
                >{line || ' '}</div>
              ))}
            </div>
          )}

          {!lines.length && item?.note && (
            <div data-testid="oss-license-note" style={{ marginTop: 16, padding: 14, borderRadius: 12, background: T.bgSubtle, border: `1px solid ${RF.softLine}`, fontSize: 11.5, lineHeight: '18px', color: T.text700 }}>
              {item.note}
            </div>
          )}
        </div>
      </div>
    </Phone>
  );
}

Object.assign(window, {
  ScreenOssLicenses,
  ScreenOssLicenseDetail,
});
