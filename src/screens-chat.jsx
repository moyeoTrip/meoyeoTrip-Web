// Chat room & Feed screens

function ScreenChatRoom() {
  const nav = (window.useNav ? window.useNav() : { back: () => {} });
  return (
    <Phone>
      <div style={{ height: '100%', background: T.bgSubtle, paddingTop: 54, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: T.bgBase, borderBottom: `1px solid ${T.line100}` }}>
          <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><div onClick={() => nav.back()} style={{ cursor: 'pointer', display: 'inline-flex' }}><Icon name="back" size={24} color={T.text900}/></div></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: T.text900 }}>경주 단풍·야경</div>
            </div>
            <Icon name="map" size={22} color={T.text700}/>
            <Icon name="menu" size={22} color={T.text700}/>
          </div>
          <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 999, background: T.primary500 }}/>
            <span style={{ fontSize: 12, color: T.text700, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>4/8명</span>
            <span style={{ fontSize: 12, color: T.text400 }}>·</span>
            <span style={{ fontSize: 12, color: T.text700 }}>마감 D-3</span>
            <span style={{ fontSize: 12, color: T.text400 }}>·</span>
            <span style={{ fontSize: 12, color: T.text700 }}>확정 D-10</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '16px 16px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* System: room created */}
          <div style={{
            background: T.primary100, borderRadius: 16, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'center',
          }}>
            <Icon name="sparkle" size={16} color={T.primary600}/>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.primary700 }}>모임이 만들어졌어요</div>
          </div>

          <div style={{ textAlign: 'center', fontSize: 11, color: T.text400, padding: '4px 0' }}>2026.4.20 (월)</div>

          {/* Received message */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <AnimalAvatar kind="bear" size={32}/>
            <div>
              <div style={{ fontSize: 11, color: T.text500, marginBottom: 4 }}>우직한 곰 7821</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                <div style={{
                  background: T.bgRaised, padding: '10px 14px', borderRadius: '18px 18px 18px 4px',
                  fontSize: 14, color: T.text900, maxWidth: 240, boxShadow: T.l1,
                }}>반갑습니다! 단풍 시즌 처음이라 설레요 ☺</div>
                <div style={{ fontSize: 10, color: T.text400 }}>10:24</div>
              </div>
            </div>
          </div>

          {/* My message */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ fontSize: 10, color: T.text400 }}>10:25</div>
            <div style={{
              background: T.primary500, color: '#fff', padding: '10px 14px',
              borderRadius: '18px 18px 4px 18px', fontSize: 14, maxWidth: 240,
            }}>저도 잘 부탁드려요 🍁</div>
          </div>

          {/* Poll card */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <AnimalAvatar kind="crane" size={32}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: T.text500, marginBottom: 4 }}>고요한 두루미 1130</div>
              <div style={{
                background: T.bgRaised, borderRadius: 16, padding: 14, boxShadow: T.l1, maxWidth: 260,
              }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
                  <Icon name="poll" size={14} color={T.primary500}/>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text900 }}>내일 모이는 시간?</div>
                </div>
                {[
                  { l: '12시', v: 3, sel: false, w: '60%' },
                  { l: '오후 2시', v: 4, sel: true, w: '80%' },
                  { l: '오후 4시', v: 1, sel: false, w: '20%' },
                ].map((o, i) => (
                  <div key={i} style={{ marginBottom: 8, position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ display: 'flex', gap: 6, alignItems: 'center', fontWeight: o.sel ? 600 : 400, color: o.sel ? T.primary700 : T.text700 }}>
                        <span style={{
                          width: 14, height: 14, borderRadius: 999, border: `1.5px solid ${o.sel ? T.primary500 : T.line300}`,
                          background: o.sel ? T.primary500 : 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {o.sel && <div style={{ width: 6, height: 6, borderRadius: 999, background: '#fff' }}/>}
                        </span>
                        {o.l}
                      </span>
                      <span style={{ color: T.text500, fontVariantNumeric: 'tabular-nums' }}>{o.v}표</span>
                    </div>
                    <div style={{ height: 4, background: T.line100, borderRadius: 999 }}>
                      <div style={{ height: '100%', width: o.w, background: o.sel ? T.primary500 : T.line300, borderRadius: 999 }}/>
                    </div>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: T.text400, marginTop: 8 }}>6명 참여 · 마감까지 2시간</div>
              </div>
            </div>
          </div>

          {/* System: joined */}
          <div style={{ textAlign: 'center', fontSize: 11, color: T.text500, padding: '6px 0' }}>
            👋 따스한 사슴 3492님이 입장했어요
          </div>
        </div>

        {/* Input */}
        <div style={{ background: T.bgBase, borderTop: `1px solid ${T.line100}`, padding: '8px 12px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: T.bgSubtle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus" size={20} color={T.text700}/>
          </div>
          <div style={{ flex: 1, height: 40, background: T.bgSubtle, borderRadius: 20, padding: '0 16px', display: 'flex', alignItems: 'center', fontSize: 14, color: T.text400 }}>
            메시지 입력
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: T.primary500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="send" size={18} color="#fff"/>
          </div>
        </div>
      </div>
    </Phone>
  );
}

// Feed timeline
function ScreenFeed() {
  const nav = (window.useNav ? window.useNav() : { toggleLike: () => {}, isLiked: () => false });
  const FeedCard = ({ id, author, kind, time, title, hue, locs, baseLikes }) => {
    const liked = nav.isLiked(id, false);
    const count = baseLikes + (liked ? 1 : 0);
    return (
    <div style={{ background: T.bgRaised, borderRadius: 16, boxShadow: T.l1, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <AnimalAvatar kind={kind} size={36}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text900 }}>{author}</div>
          <div style={{ fontSize: 11, color: T.text500 }}>{time}</div>
        </div>
        <Icon name="more" size={18} color={T.text400}/>
      </div>
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.text900, lineHeight: '26px', letterSpacing: '-0.3px' }}>{title}</div>
      </div>
      <div style={{ display: 'flex', gap: 2, padding: '0 16px' }}>
        <div style={{ flex: 1, borderRadius: '12px 0 0 12px', overflow: 'hidden' }}>
          <ImgPlaceholder hue={hue} height={180} radius={0} label="travel photo"/>
        </div>
        <div style={{ flex: 1, borderRadius: '0 12px 12px 0', overflow: 'hidden' }}>
          <MiniMap height={180}/>
        </div>
      </div>
      <div style={{ padding: '12px 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: T.text700, marginBottom: 10 }}>
          <Icon name="pin" size={14} color={T.primary500}/>
          <span>{locs}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div onClick={() => nav.toggleLike(id)} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', userSelect: 'none' }}>
            {liked
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill={T.accent500}><path d="M12 21s-7.5-4.7-9.5-9.4C1 8 3.5 4 7.5 4c2 0 3.5 1.2 4.5 2.7C13 5.2 14.5 4 16.5 4 20.5 4 23 8 21.5 11.6 19.5 16.3 12 21 12 21z"/></svg>
              : <Icon name="heart" size={18} color={T.text500}/>
            }
            <span style={{ fontSize: 13, color: liked ? T.accent700 : T.text700, fontVariantNumeric: 'tabular-nums', fontWeight: liked ? 600 : 400 }}>{count}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon name="chat" size={18} color={T.text500}/>
            <span style={{ fontSize: 13, color: T.text700, fontVariantNumeric: 'tabular-nums' }}>8</span>
          </div>
          <div style={{ flex: 1 }}/>
          <div style={{ fontSize: 12, color: T.primary600 }}>#가을 #단풍</div>
        </div>
      </div>
    </div>
    );
  };
  return (
    <Phone>
      <div style={{ height: '100%', background: T.bgSubtle, paddingTop: 54, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.bgBase, borderBottom: `1px solid ${T.line100}` }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.text900, letterSpacing: '-0.5px' }}>피드</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Icon name="search" size={22} color={T.text700}/>
            <Icon name="bell" size={22} color={T.text700}/>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '12px 20px', background: T.bgBase, borderBottom: `1px solid ${T.line100}` }}>
          {['전체', '친구', '내 여행'].map((t, i) => (
            <div key={i} style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500,
              background: i === 0 ? T.text900 : 'transparent',
              color: i === 0 ? '#fff' : T.text500,
              border: i === 0 ? 'none' : `1px solid ${T.line200}`,
            }}>{t}</div>
          ))}
        </div>
        <div style={{ flex: 1, overflow: 'hidden', padding: '16px 16px 100px' }}>
          <FeedCard
            id="f1"
            author="잔잔한 거북이 9032"
            kind="turtle"
            time="3시간 전"
            title="첫 반패키지 단풍 여행"
            hue="autumn"
            locs="경주 · 황리단길 · 3 stops"
            baseLikes={34}
          />
          <FeedCard
            id="f2"
            author="우직한 곰 7821"
            kind="bear"
            time="어제"
            title="안동 한옥에서 보낸 1박"
            hue="forest"
            locs="안동 · 하회마을 · 4 stops"
            baseLikes={28}
          />
        </div>
        <BottomNav active="feed"/>
      </div>
    </Phone>
  );
}

// My page
function ScreenMyPage() {
  const nav = (window.useNav ? window.useNav() : { go: () => {} });
  return (
    <Phone>
      <div style={{ height: '100%', background: T.bgSubtle, paddingTop: 54, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.bgBase }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.text900, letterSpacing: '-0.5px' }}>마이</div>
          <div onClick={() => nav.go('settings')} style={{ cursor: 'pointer' }}><Icon name="more" size={22} color={T.text700}/></div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {/* Profile card */}
          <div onClick={() => nav.go('profile-edit')} style={{ background: T.bgBase, padding: '24px 20px 28px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
            <AnimalAvatar kind="deer" size={72}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.text900 }}>따스한 사슴 <span style={{ fontVariantNumeric: 'tabular-nums', color: T.text700 }}>3492</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <Icon name="star" size={14} color={T.warning}/>
                <span style={{ fontSize: 13, color: T.text700, fontWeight: 600 }}>4.9</span>
                <span style={{ fontSize: 12, color: T.text400 }}>·</span>
                <span style={{ fontSize: 13, color: T.text500 }}>여행 6회</span>
              </div>
            </div>
            <Icon name="arrow" size={18} color={T.text400}/>
          </div>

          {/* Stats */}
          <div style={{ background: T.bgBase, margin: '0 20px', borderRadius: 16, display: 'flex', boxShadow: T.l1, marginTop: -16, position: 'relative', zIndex: 2 }}>
            {[
              { n: '6', l: '여행', go: 'feed' },
              { n: '12', l: '친구', go: 'dex' },
              { n: '4', l: '피드', go: 'feed' },
            ].map((s, i) => (
              <div key={i} onClick={() => nav.go(s.go)} style={{ flex: 1, padding: '16px 0', textAlign: 'center', borderRight: i < 2 ? `1px solid ${T.line100}` : 'none', cursor: 'pointer' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: T.text900, fontVariantNumeric: 'tabular-nums' }}>{s.n}</div>
                <div style={{ fontSize: 12, color: T.text500, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* In-progress trip */}
          <div style={{ padding: '24px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text900 }}>진행 중인 여행</div>
            <div style={{ fontSize: 12, color: T.text500 }}>전체 ›</div>
          </div>
          <div style={{ margin: '0 20px', background: T.bgRaised, borderRadius: 16, padding: 14, boxShadow: T.l1 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 12, overflow: 'hidden' }}>
                <ImgPlaceholder hue="autumn" height={64} radius={0}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  <Chip variant="accent" size="sm">D-3</Chip>
                  <Chip variant="primary" size="sm">호스트</Chip>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text900 }}>경주 단풍·야경</div>
                <div style={{ fontSize: 12, color: T.text500, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>11/8(토) · 4/8명</div>
              </div>
            </div>
            <div style={{ height: 12 }}/>
            <ProgressBar current={4} max={8} min={3}/>
          </div>

          {/* Menu list */}
          <div style={{ margin: '24px 20px', background: T.bgRaised, borderRadius: 16, boxShadow: T.l1, overflow: 'hidden' }}>
            {[
              { i: 'bookmark', l: '저장한 코스', n: '8', go: 'explore' },
              { i: 'users', l: '친구 도감', n: '12', go: 'dex' },
              { i: 'bell', l: '알림 설정', go: 'settings' },
              { i: 'note', l: '이용 약관', go: 'terms' },
            ].map((m, i, a) => (
              <div key={i} onClick={() => nav.go(m.go)} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: i < a.length - 1 ? `1px solid ${T.line100}` : 'none', gap: 14, cursor: 'pointer' }}>
                <Icon name={m.i} size={20} color={T.text700}/>
                <div style={{ flex: 1, fontSize: 14, color: T.text900 }}>{m.l}</div>
                {m.n && <div style={{ fontSize: 13, color: T.text500, fontVariantNumeric: 'tabular-nums' }}>{m.n}</div>}
                <Icon name="arrow" size={16} color={T.text400}/>
              </div>
            ))}
          </div>
        </div>
        <BottomNav active="my"/>
      </div>
    </Phone>
  );
}

// Explore list
function ScreenExplore() {
  const nav = (window.useNav ? window.useNav() : { go: () => {}, back: () => {} });
  return (
    <Phone>
      <div style={{ height: '100%', background: T.bgSubtle, paddingTop: 54, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: T.bgBase, borderBottom: `1px solid ${T.line100}` }}>
          <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div onClick={() => nav.back()} style={{ cursor: 'pointer' }}><div onClick={() => nav.back()} style={{ cursor: 'pointer', display: 'inline-flex' }}><Icon name="back" size={24} color={T.text900}/></div></div>
            <div style={{ flex: 1, fontSize: 16, fontWeight: 600, color: T.text900 }}>탐색</div>
            <div onClick={() => nav.go('search')} style={{ cursor: 'pointer' }}><Icon name="search" size={22} color={T.text700}/></div>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', padding: '0 20px' }}>
            {['코스', '모집'].map((t, i) => (
              <div key={i} style={{
                flex: 1, padding: '14px 0', textAlign: 'center', fontSize: 15, fontWeight: 600,
                color: i === 1 ? T.primary600 : T.text500,
                borderBottom: i === 1 ? `2px solid ${T.primary500}` : `2px solid transparent`,
              }}>{t}</div>
            ))}
          </div>
        </div>
        {/* Filter chips */}
        <div style={{ background: T.bgBase, borderBottom: `1px solid ${T.line100}`, padding: '12px 20px', display: 'flex', gap: 8, overflow: 'hidden' }}>
          {['지역 ▾', '일정 ▾', '인원 ▾', '성별 ▾'].map((f, i) => (
            <div key={i} style={{
              padding: '8px 14px', borderRadius: 999, border: `1px solid ${i === 0 ? T.primary500 : T.line200}`,
              background: i === 0 ? T.primary50 : 'transparent',
              fontSize: 13, fontWeight: 500, color: i === 0 ? T.primary700 : T.text700, whiteSpace: 'nowrap',
            }}>{f}</div>
          ))}
        </div>
        <div style={{ padding: '12px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: T.text500, fontVariantNumeric: 'tabular-nums' }}>23건의 모집</div>
          <div style={{ fontSize: 12, color: T.text700, fontWeight: 500 }}>인기순 ▾</div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', padding: '0 20px' }}>
          {[
            { hue: 'autumn', dn: 'D-1', urgent: true, n: '경주 단풍·야경 1박', date: '11/8(토) · 1박 2일', cur: 4, max: 8, host: '고요한 두루미 1130', kind: 'crane' },
            { hue: 'sunset', dn: 'D-3', urgent: false, n: '안동 한옥과 헛제삿밥', date: '11/15(금) · 1박 2일', cur: 2, max: 6, host: '잔잔한 거북이 9032', kind: 'turtle' },
          ].map((c, i) => (
            <div key={i} onClick={() => nav.go('detail')} style={{ background: T.bgRaised, borderRadius: 16, boxShadow: T.l1, padding: 14, marginBottom: 12, cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <AnimalAvatar kind={c.kind} size={32}/>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: T.text700 }}>{c.host}</div>
                <Chip variant={c.urgent ? 'accent' : 'neutral'} size="md">{c.dn}</Chip>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 84, height: 84, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                  <ImgPlaceholder hue={c.hue} height={84} radius={0}/>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: T.text900 }}>{c.n}</div>
                    <div style={{ fontSize: 12, color: T.text500, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{c.date}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <div style={{ flex: 1 }}>
                      <ProgressBar current={c.cur} max={c.max} min={3}/>
                    </div>
                    <div style={{ fontSize: 12, color: T.text700, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{c.cur}/{c.max}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Map toggle FAB */}
        <div onClick={() => nav.go('explore-map')} style={{
          position: 'absolute', bottom: 104, left: '50%', transform: 'translateX(-50%)',
          padding: '12px 20px', background: T.text900, color: '#fff', borderRadius: 999,
          fontSize: 14, fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center', boxShadow: T.l2, zIndex: 10, cursor: 'pointer',
        }}>
          <Icon name="map" size={18} color="#fff"/>
          지도 보기
        </div>
        <BottomNav active="compass"/>
      </div>
    </Phone>
  );
}

// ─── window export ───
Object.assign(window, { ScreenChatRoom, ScreenFeed, ScreenMyPage, ScreenExplore });
