// Home & Group screens

// Home screen
function ScreenHome() {
  const nav = (window.useNav ? window.useNav() : { go: () => {} });
  const [cat, setCat] = React.useState('전체');
  const Press = ({ children, onClick, style }) => (
    <div onClick={onClick} style={{ cursor: 'pointer', ...(style || {}) }}>{children}</div>
  );
  return (
    <Phone>
      <div style={{ height: '100%', background: T.bgBase, paddingTop: 54, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.text900, letterSpacing: '-0.5px' }}>홈</div>
          <Press onClick={() => nav.go('notif')} style={{ position: 'relative' }}>
            <Icon name="bell" size={22} color={T.text700}/>
            <div style={{ position: 'absolute', top: -1, right: -1, width: 7, height: 7, borderRadius: 999, background: T.primary500, border: '1.5px solid #fff' }}/>
          </Press>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {/* Greeting */}
          <div style={{ padding: '8px 20px 20px' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.text900, lineHeight: '30px', letterSpacing: '-0.5px' }}>
              안녕하세요, 여행자님 👋
            </div>
            <div style={{ fontSize: 14, color: T.text500, marginTop: 6 }}>
              이번 주말, 어디로 떠나볼까요?
            </div>
          </div>

          {/* Hero illustration card with bears */}
          <div style={{ margin: '0 20px 24px', borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(180deg, #E8F1E5 0%, #D4E5CE 100%)', position: 'relative', height: 200 }}>
            {/* Sky clouds */}
            <svg width="100%" height="60" viewBox="0 0 320 60" style={{ position: 'absolute', top: 0, left: 0 }}>
              <ellipse cx="40" cy="20" rx="22" ry="8" fill="#fff" opacity="0.6"/>
              <ellipse cx="240" cy="14" rx="28" ry="9" fill="#fff" opacity="0.7"/>
            </svg>
            {/* Mountains backdrop */}
            <svg width="100%" height="120" viewBox="0 0 320 120" style={{ position: 'absolute', bottom: 0, left: 0 }} preserveAspectRatio="xMidYMax meet">
              <path d="M0 80 L40 50 L80 70 L130 40 L180 65 L240 35 L290 60 L320 50 L320 120 L0 120 Z" fill="#A8C49A" opacity="0.5"/>
              <path d="M0 100 L50 75 L100 90 L160 70 L220 88 L280 75 L320 85 L320 120 L0 120 Z" fill="#7AA070" opacity="0.7"/>
            </svg>
            {/* Hanok roof on left */}
            <svg width="80" height="50" viewBox="0 0 80 50" style={{ position: 'absolute', bottom: 30, left: 14, opacity: 0.85 }}>
              <path d="M0 22 Q40 4 80 22 L74 26 Q40 10 6 26 Z" fill="#3F2A1A"/>
              <rect x="14" y="26" width="52" height="18" fill="#5A3F28"/>
              <rect x="22" y="32" width="10" height="12" fill="#2A1810"/>
              <rect x="48" y="32" width="10" height="12" fill="#2A1810"/>
            </svg>
            {/* Bears */}
            <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)' }}>
              <BearGroup size={140}/>
            </div>
            {/* Title overlay */}
            <div style={{ position: 'absolute', top: 18, left: 18, right: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.primary700, opacity: 0.8 }}>이번 주말, 어디로 떠나볼까요?</div>
              <div style={{ fontSize: 11, color: T.text500, marginTop: 2 }}>지금 인기 있는 코스를 추천해드려요</div>
            </div>
          </div>

          {/* Category chips */}
          <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8, overflowX: 'auto' }}>
            {['전체', '자연', '문화', '맛집', '체험'].map(c => (
              <CategoryChip key={c} label={c} active={cat === c} onClick={() => setCat(c)}/>
            ))}
          </div>

          {/* Section: 이번 주 추천 코스 */}
          <div style={{ padding: '0 20px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text900 }}>이번 주 추천 코스</div>
              <div style={{ fontSize: 12, color: T.text500, cursor: 'pointer' }} onClick={() => nav.go('explore')}>[더보기]</div>
            </div>
            <div onClick={() => nav.go('detail')} style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${T.line100}`, background: T.bgRaised, cursor: 'pointer' }}>
              <ImgPlaceholder hue="forest" height={160} radius={0}/>
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.text900 }}>주왕산 & 주산지 힐링 트레킹</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span style={{ fontSize: 12, color: T.text500 }}>자연</span>
                  <span style={{ fontSize: 12, color: T.text400 }}>·</span>
                  <span style={{ fontSize: 12, color: T.text500 }}>2시간 코스</span>
                  <span style={{ fontSize: 12, color: T.text400 }}>·</span>
                  <span style={{ fontSize: 12, color: T.text900, fontWeight: 600 }}>★ 4.8</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: 지금 모집 중인 모임 */}
          <div style={{ padding: '0 20px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text900 }}>지금 모집 중인 모임</div>
              <div style={{ fontSize: 12, color: T.text500, cursor: 'pointer' }} onClick={() => nav.go('chat-list')}>[더보기]</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { hue: 'hanok', dn: 'D-3', name: '안동 하회마을 하루여행', meta: '3/4명' },
                { hue: 'autumn', dn: 'D-2', name: '경주 경발 데이트 코스', meta: '2/4명' },
              ].map((m, i) => (
                <div key={i} onClick={() => nav.go('detail')} style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.line100}`, background: T.bgRaised, cursor: 'pointer' }}>
                  <div style={{ position: 'relative' }}>
                    <ImgPlaceholder hue={m.hue} height={100} radius={0}/>
                    <div style={{ position: 'absolute', top: 8, left: 8, padding: '3px 8px', borderRadius: 6, background: 'rgba(15,23,20,0.7)', color: '#fff', fontSize: 10, fontWeight: 600 }}>{m.dn}</div>
                  </div>
                  <div style={{ padding: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text900, lineHeight: '16px' }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: T.text500, marginTop: 4 }}>{m.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: 데이터로 보는 경북 여행 */}
          <div style={{ padding: '0 20px 28px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text900, marginBottom: 12 }}>데이터로 보는 경북 여행</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: 14, borderRadius: 14, border: `1px solid ${T.line100}`, background: T.bgRaised }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 11, color: T.text500 }}>인기 지역</div>
                  <svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke={T.primary500} strokeWidth="1.5"/><path d="M12 7v6h4" stroke={T.primary500} strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text900, marginTop: 10 }}>경주</div>
                <div style={{ fontSize: 11, color: T.text500, marginTop: 2 }}>날씨 맑음</div>
              </div>
              <div style={{ padding: 14, borderRadius: 14, border: `1px solid ${T.line100}`, background: T.bgRaised }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 11, color: T.text500 }}>오늘 날씨</div>
                  <Icon name="sun" size={20} color="#E8B547"/>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text900, marginTop: 10 }}>22°C</div>
                <div style={{ fontSize: 11, color: T.text500, marginTop: 2 }}>맑음</div>
              </div>
            </div>
          </div>

          <div style={{ height: 100 }}/>
        </div>

        {/* FAB */}
        <div onClick={() => nav.go('create-review')} style={{
          position: 'absolute', right: 20, bottom: 104, width: 52, height: 52, borderRadius: 999,
          background: T.primary500, boxShadow: T.l2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, cursor: 'pointer',
        }}>
          <Icon name="plus" size={24} color="#fff" strokeWidth={2.4}/>
        </div>

        <BottomNav active="home"/>
      </div>
    </Phone>
  );
}

// Group detail
function ScreenGroupDetail() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {}, toggleLike: () => {}, isLiked: () => false });
  const liked = nav.isLiked('group-1', false);
  return (
    <Phone>
      <div style={{ height: '100%', background: T.bgSubtle, paddingTop: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Hero */}
        <div style={{ position: 'relative' }}>
          <ImgPlaceholder hue="autumn" height={280} radius={0} label="course · 경주 단풍"/>
          <div style={{ position: 'absolute', top: 54, left: 0, right: 0, padding: '0 20px', display: 'flex', justifyContent: 'space-between', zIndex: 5 }}>
            <div onClick={() => nav.back()} style={{
              width: 40, height: 40, borderRadius: 999,
              background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)', cursor: 'pointer',
            }}>
              <div onClick={() => nav.back()} style={{ cursor: 'pointer', display: 'inline-flex' }}><Icon name="back" size={20} color={T.text900}/></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div onClick={() => nav.toggleLike('group-1')} style={{ width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', cursor: 'pointer', transition: 'transform 120ms' }}>
                {liked
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill={T.accent500}><path d="M12 21s-7.5-4.7-9.5-9.4C1 8 3.5 4 7.5 4c2 0 3.5 1.2 4.5 2.7C13 5.2 14.5 4 16.5 4 20.5 4 23 8 21.5 11.6 19.5 16.3 12 21 12 21z"/></svg>
                  : <Icon name="bookmark" size={20} color={T.text900}/>
                }
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                <Icon name="more" size={20} color={T.text900}/>
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', background: T.bgSubtle }}>
          <div style={{ padding: '20px 20px 16px', background: T.bgBase }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <Chip variant="accent" size="md">D-3</Chip>
              <Chip variant="neutral" size="md">자동 승인</Chip>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.text900, lineHeight: '30px', letterSpacing: '-0.5px' }}>경주 단풍·야경 1박 2일</div>
            <div style={{ height: 12 }}/>
            <div style={{ fontSize: 14, color: T.text700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="clock" size={16} color={T.text500}/> 11/8(토)~11/9(일) · 1박 2일
            </div>
            <div style={{ fontSize: 13, color: T.warning, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
              모집 마감 D-3 · 14시간 남음
            </div>
          </div>

          {/* Host card */}
          <div style={{ margin: '12px 20px', background: T.bgRaised, borderRadius: 16, padding: 16, boxShadow: T.l1, display: 'flex', alignItems: 'center', gap: 14 }}>
            <AnimalAvatar kind="crane" size={56}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text900 }}>고요한 두루미 <span style={{ fontVariantNumeric: 'tabular-nums', color: T.text700 }}>1130</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Icon name="star" size={14} color={T.warning}/>
                <span style={{ fontSize: 12, color: T.text700, fontWeight: 600 }}>4.8</span>
                <span style={{ fontSize: 12, color: T.text400 }}>·</span>
                <span style={{ fontSize: 12, color: T.text500 }}>여행 12회</span>
              </div>
            </div>
            <Icon name="arrow" size={18} color={T.text400}/>
          </div>

          {/* People status */}
          <div style={{ margin: '12px 20px', background: T.bgRaised, borderRadius: 16, padding: 16, boxShadow: T.l1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 18, fontWeight: 700, color: T.text900, fontVariantNumeric: 'tabular-nums' }}>4 / 8명</span>
                <span style={{ fontSize: 13, color: T.text500, marginLeft: 8 }}>· 최소 3명 ✓</span>
              </div>
              <div style={{ display: 'flex' }}>
                {['deer','bear','rabbit','turtle'].map((k, i) => (
                  <div key={i} style={{ marginLeft: i === 0 ? 0 : -10, border: `2px solid ${T.bgRaised}`, borderRadius: '50%' }}>
                    <AnimalAvatar kind={k} size={28}/>
                  </div>
                ))}
              </div>
            </div>
            <ProgressBar current={4} max={8} min={3}/>
          </div>

          {/* Chat preview */}
          <div style={{ margin: '12px 20px 16px', background: T.bgRaised, borderRadius: 16, padding: 16, boxShadow: T.l1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text500, marginBottom: 12 }}>채팅방 미리보기</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <AnimalAvatar kind="bear" size={28}/>
              <div>
                <div style={{ fontSize: 11, color: T.text500, marginBottom: 3 }}>우직한 곰 7821</div>
                <div style={{ background: T.bgSubtle, padding: '8px 12px', borderRadius: '14px 14px 14px 4px', fontSize: 13, color: T.text900, maxWidth: 200 }}>
                  단풍 시즌 처음이에요 잘 부탁드려요!
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <AnimalAvatar kind="crane" size={28}/>
              <div>
                <div style={{ fontSize: 11, color: T.text500, marginBottom: 3 }}>고요한 두루미 1130</div>
                <div style={{ background: T.bgSubtle, padding: '8px 12px', borderRadius: '14px 14px 14px 4px', fontSize: 13, color: T.text900, maxWidth: 200 }}>
                  네 환영합니다 ☺ 11/8 오후 2시 경주역에서 만나요
                </div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: T.text400, marginTop: 10, textAlign: 'center' }}>
              신청하면 전체 대화를 볼 수 있어요
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '12px 20px 32px', background: T.bgBase, borderTop: `1px solid ${T.line100}` }}>
          <div onClick={() => nav.go('apply')}>
            <Btn variant="primary" full>함께 가기 신청</Btn>
          </div>
        </div>
      </div>
    </Phone>
  );
}

// Apply bottom sheet
function ScreenApplySheet() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  return (
    <Phone>
      <div onClick={() => nav.back()} style={{ height: '100%', background: T.bgOverlay, paddingTop: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative' }}>
        {/* Faded bg */}
        <div style={{ position: 'absolute', inset: 0, background: T.bgOverlay }}/>
        {/* Sheet */}
        <div onClick={(e) => e.stopPropagation()} style={{
          background: T.bgRaised, borderTopLeftRadius: 24, borderTopRightRadius: 24,
          padding: '8px 20px 32px', position: 'relative', zIndex: 5,
          boxShadow: T.l3,
        }}>
          <div style={{ width: 36, height: 4, background: T.line300, borderRadius: 999, margin: '0 auto 16px' }}/>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.text900, letterSpacing: '-0.5px' }}>
            이 모집에 같이 가고 싶으세요?
          </div>
          <div style={{ height: 8 }}/>
          <div style={{ fontSize: 14, color: T.text500, lineHeight: '22px' }}>
            호스트가 볼 수 있도록 간단한 한마디를 남겨주세요
          </div>
          <div style={{ height: 16 }}/>
          <div style={{
            background: T.bgSubtle, borderRadius: 12, padding: '14px 16px',
            border: `1.5px solid ${T.primary500}`, boxShadow: `0 0 0 4px ${T.primary50}`,
            minHeight: 120,
          }}>
            <div style={{ fontSize: 15, color: T.text900, lineHeight: '22px' }}>
              단풍 보러 처음 가는데 잘 부탁드려요!
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <div style={{ fontSize: 12, color: T.text400 }}></div>
            <div style={{ fontSize: 12, color: T.text400, fontVariantNumeric: 'tabular-nums' }}>23/200</div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {['단풍 시즌 처음이에요', '사진 좋아해요', '처음 반패키지 여행이에요'].map((p, i) => (
              <div key={i} style={{
                padding: '8px 12px', background: T.primary50, color: T.primary700,
                borderRadius: 999, fontSize: 12, fontWeight: 500,
              }}>{p}</div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, padding: '12px 0' }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, background: T.primary500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={14} color="#fff" strokeWidth={3}/>
            </div>
            <div style={{ fontSize: 13, color: T.text700 }}>내 매너점수·여행 횟수를 호스트가 볼 수 있게 함</div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <div onClick={() => nav.back()} style={{ flex: 1 }}><Btn variant="secondary" full>취소</Btn></div>
            <div onClick={() => nav.go('chat')} style={{ flex: 1.4 }}><Btn variant="primary" full>신청하기</Btn></div>
          </div>
        </div>
      </div>
    </Phone>
  );
}

Object.assign(window, { ScreenHome, ScreenGroupDetail, ScreenApplySheet });

// ─── window export ───
Object.assign(window, { ScreenHome, ScreenGroupDetail, ScreenApplySheet });
