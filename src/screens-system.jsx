// Design System overview card

function ScreenDesignSystem() {
  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: T.text500, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
  const Swatch = ({ color, name, hex }) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ width: '100%', aspectRatio: '1', borderRadius: 12, background: color, border: `1px solid ${T.line100}` }}/>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.text900, marginTop: 6 }}>{name}</div>
      <div style={{ fontSize: 10, color: T.text500, fontFamily: 'ui-monospace, "SF Mono", monospace' }}>{hex}</div>
    </div>
  );
  return (
    <div style={{
      width: 540, height: 800, background: T.bgBase, borderRadius: 24, padding: 32,
      fontFamily: T.fontStack, color: T.text900, overflow: 'auto', boxShadow: T.l1,
      border: `1px solid ${T.line100}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <svg width="28" height="28" viewBox="0 0 64 64">
          <path d="M8 50 L22 28 L34 44 L46 22 L56 50 Z" fill={T.primary500}/>
          <circle cx="22" cy="20" r="6" fill={T.accent500}/>
        </svg>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>모여트립 in 경북</div>
      </div>
      <div style={{ fontSize: 13, color: T.text500, marginBottom: 28 }}>디자인 시스템 · 경상북도 특화 반패키지 매칭 플랫폼</div>

      <Section title="Brand Primary · 경북 포레스트">
        <div style={{ display: 'flex', gap: 8 }}>
          <Swatch color={T.primary100} name="100" hex="#DCEFE3"/>
          <Swatch color={T.primary300} name="300" hex="#7EC49B"/>
          <Swatch color={T.primary500} name="500 ★" hex="#2D8F5A"/>
          <Swatch color={T.primary700} name="700" hex="#155735"/>
          <Swatch color={T.primary900} name="900" hex="#061E13"/>
        </div>
      </Section>

      <Section title="Accent · 선셋 코랄">
        <div style={{ display: 'flex', gap: 8 }}>
          <Swatch color={T.accent100} name="100" hex="#FFE4DA"/>
          <Swatch color={T.accent300} name="300" hex="#FFAE95"/>
          <Swatch color={T.accent500} name="500 ★" hex="#FF7550"/>
          <Swatch color={T.accent700} name="700" hex="#B64227"/>
        </div>
      </Section>

      <Section title="Semantic">
        <div style={{ display: 'flex', gap: 8 }}>
          <Swatch color={T.success} name="Success" hex="#2D8F5A"/>
          <Swatch color={T.warning} name="Warning" hex="#E8A547"/>
          <Swatch color={T.danger} name="Danger" hex="#E85547"/>
          <Swatch color={T.info} name="Info" hex="#4A90E2"/>
        </div>
      </Section>

      <Section title="Typography · Pretendard">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { l: 'Display-S · 26/34 Bold', s: 26, w: 700, t: '낯선 사람 대신 새 친구' },
            { l: 'Headline-L · 22/30 Bold', s: 22, w: 700, t: '경주 단풍·야경 1박 2일' },
            { l: 'Headline-S · 16/24 SemiBold', s: 16, w: 600, t: '따스한 사슴 3492' },
            { l: 'Body-M · 14/22 Regular', s: 14, w: 400, t: '단풍 보러 처음 가는데 잘 부탁드려요!' },
            { l: 'Caption · 12/16 Medium', s: 12, w: 500, t: '11/8(토) · 4/8명 · 경주역' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <div style={{ fontSize: 10, color: T.text400, width: 180, fontFamily: 'ui-monospace, "SF Mono", monospace' }}>{r.l}</div>
              <div style={{ fontSize: r.s, fontWeight: r.w, color: T.text900, letterSpacing: '-0.3px' }}>{r.t}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Components">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
          <Btn variant="primary" icon="check">신청하기</Btn>
          <Btn variant="secondary">취소</Btn>
          <Btn variant="ghost">건너뛰기</Btn>
          <Btn variant="primary" disabled>승인 대기 중</Btn>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <Chip variant="primary" size="md">진행 중</Chip>
          <Chip variant="accent" size="md">D-1</Chip>
          <Chip variant="warning" size="md">인원 미달</Chip>
          <Chip variant="danger" size="md">소멸</Chip>
          <Chip variant="neutral" size="md">자동 승인</Chip>
        </div>
        <div style={{ background: T.bgSubtle, padding: 16, borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: T.text500, marginBottom: 10 }}>인원 프로그레스바 (서비스 시그니처)</div>
          <ProgressBar current={4} max={8} min={3}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: T.text700 }}>
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>4 / 8명</span>
            <span>최소 3명 ✓</span>
          </div>
        </div>
      </Section>

      <Section title="Animal Avatars · 동물 친구 (Gen-AI 캐릭터 톤 가이드)">
        <div style={{ display: 'flex', gap: 14, justifyContent: 'space-between' }}>
          {[
            { k: 'deer', n: '따스한 사슴' },
            { k: 'turtle', n: '잔잔한 거북이' },
            { k: 'raccoon', n: '호기심 너구리' },
            { k: 'bear', n: '우직한 곰' },
            { k: 'rabbit', n: '엉뚱한 토끼' },
            { k: 'crane', n: '고요한 두루미' },
          ].map(a => (
            <div key={a.k} style={{ textAlign: 'center', flex: 1 }}>
              <AnimalAvatar kind={a.k} size={56}/>
              <div style={{ fontSize: 10, color: T.text500, marginTop: 6 }}>{a.n}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

Object.assign(window, { ScreenDesignSystem });

// ─── window export ───
Object.assign(window, { ScreenDesignSystem });
