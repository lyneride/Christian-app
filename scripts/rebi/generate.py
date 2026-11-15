"""Generates the Rebi mascot SVGs (public/rebi/*.svg) and the app icon (src/app/icon.svg).

Rebi is Bleibe's own mascot: a little grape with a vine leaf (John 15, the vine and the branches).
Each pose is a self-contained SVG with a tiny CSS animation that switches off for
`prefers-reduced-motion`. Run from the repo root:  python3 scripts/rebi/generate.py
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "public", "rebi")
os.makedirs(OUT, exist_ok=True)

INK = "#2B2340"
HI, BODY, LO = "#A68BFF", "#7650F5", "#5A36DB"
LIMB, HAND = "#5F3BE0", "#7A57F7"
LEAF, LEAF_D, STEM = "#2EC27E", "#1C9A61", "#5C8A2F"


def style(extra=""):
    return f"""<style>
.blink{{transform-box:fill-box;transform-origin:center;animation:blink 5s infinite}}
@keyframes blink{{0%,92%,100%{{transform:scaleY(1)}}95%{{transform:scaleY(.1)}}}}
{extra}
@media (prefers-reduced-motion:reduce){{*{{animation:none!important}}}}
</style>"""


def arm(sx, sy, cx, cy, hx, hy, cls=""):
    c = f' class="{cls}"' if cls else ""
    return (f'<g{c}><path d="M{sx} {sy} Q{cx} {cy} {hx} {hy}" stroke="{LIMB}" stroke-width="15" stroke-linecap="round" fill="none"/>'
            f'<circle cx="{hx}" cy="{hy}" r="10.5" fill="{HAND}"/></g>')


def eyes(kind="open", look=(0, 0)):
    dx, dy = look
    if kind == "open":
        e = ""
        for x in (96, 144):
            e += (f'<ellipse cx="{x}" cy="140" rx="17" ry="20" fill="#fff"/>'
                  f'<circle cx="{x + 3 + dx}" cy="{144 + dy}" r="10.5" fill="{INK}"/>'
                  f'<circle cx="{x + 7 + dx}" cy="{139 + dy}" r="3.6" fill="#fff"/>')
        return f'<g class="blink">{e}</g>'
    if kind == "happy":
        return "".join(f'<path d="M{x - 13} 146 Q{x} 128 {x + 13} 146" stroke="{INK}" stroke-width="6" stroke-linecap="round" fill="none"/>' for x in (96, 144))
    if kind == "closed":
        return "".join(f'<path d="M{x - 12} 142 Q{x} 153 {x + 12} 142" stroke="{INK}" stroke-width="5.5" stroke-linecap="round" fill="none"/>' for x in (96, 144))
    return ""


def mouth(kind):
    if kind == "smile":
        return f'<path d="M107 172 Q120 186 133 172" stroke="{INK}" stroke-width="5" stroke-linecap="round" fill="none"/>'
    if kind == "open":
        return (f'<path d="M105 170 Q120 194 135 170 Z" fill="{INK}"/>'
                '<path d="M112 181 Q120 175 128 181 Q120 188 112 181 Z" fill="#FF7A93"/>')
    if kind == "small":
        return f'<path d="M113 174 Q120 180 127 174" stroke="{INK}" stroke-width="4.5" stroke-linecap="round" fill="none"/>'
    if kind == "o":
        return f'<ellipse cx="120" cy="176" rx="6" ry="7" fill="{INK}"/>'
    return ""


CHEEKS = ('<ellipse cx="76" cy="168" rx="11" ry="7" fill="#FF8FB1" opacity=".75"/>'
          '<ellipse cx="164" cy="168" rx="11" ry="7" fill="#FF8FB1" opacity=".75"/>')
DEFS = (f'<defs><radialGradient id="rb" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="{HI}"/>'
        f'<stop offset=".55" stop-color="{BODY}"/><stop offset="1" stop-color="{LO}"/></radialGradient></defs>')
TOP = (f'<path d="M120 70 C118 58 116 50 112 40" stroke="{STEM}" stroke-width="8" stroke-linecap="round" fill="none"/>'
       f'<path d="M113 48 C98 46 90 32 100 24 C108 18 116 26 110 32" stroke="{STEM}" stroke-width="4" stroke-linecap="round" fill="none"/>'
       f'<g class="leaf"><path d="M116 52 C132 30 166 26 184 40 C170 62 138 68 116 52 Z" fill="{LEAF}"/>'
       f'<path d="M122 50 C140 46 158 42 174 40" stroke="{LEAF_D}" stroke-width="3" stroke-linecap="round" fill="none"/></g>')
BODY_SHAPE = ('<ellipse cx="120" cy="150" rx="77" ry="87" fill="url(#rb)"/>'
              '<ellipse cx="80" cy="104" rx="13" ry="24" fill="#fff" opacity=".30" transform="rotate(35 80 104)"/>'
              '<circle cx="66" cy="132" r="5" fill="#fff" opacity=".30"/>')
FEET = (f'<ellipse cx="96" cy="232" rx="19" ry="10" fill="{LIMB}"/>'
        f'<ellipse cx="144" cy="232" rx="19" ry="10" fill="{LIMB}"/>')
SHADOW = f'<ellipse cx="120" cy="244" rx="60" ry="8" fill="{INK}" opacity=".10"/>'


def pose(name):
    back, front, extra_back, extra_front, css = "", "", "", "", ""
    e, m, look = "open", "open", (0, 0)
    body_cls = "body"
    if name == "wave":
        back = arm(56, 150, 22, 132, 30, 96, "wave") + arm(184, 160, 212, 180, 204, 204)
        extra_back = ('<g class="wave"><path d="M14 86 q-8 -6 -4 -14" stroke="#FFB020" stroke-width="4" stroke-linecap="round" fill="none"/>'
                      '<path d="M28 74 q-2 -10 6 -14" stroke="#FFB020" stroke-width="4" stroke-linecap="round" fill="none"/></g>')
        css = (".wave{transform-box:view-box;transform-origin:56px 150px;animation:wave 1.6s ease-in-out infinite}"
               "@keyframes wave{0%,100%{transform:rotate(0)}25%{transform:rotate(-14deg)}75%{transform:rotate(10deg)}}")
    elif name == "point":
        back = arm(60, 166, 36, 186, 42, 208) + arm(186, 146, 214, 132, 234, 116, "pt")
        look, m = (5, -2), "smile"
        css = (".pt{transform-box:view-box;transform-origin:186px 146px;animation:pt 1.4s ease-in-out infinite}"
               "@keyframes pt{0%,100%{transform:rotate(0)}50%{transform:rotate(-6deg)}}")
    elif name == "read":
        back = arm(58, 160, 40, 190, 72, 196) + arm(182, 160, 200, 190, 168, 196)
        look, m = (0, 6), "small"
        front = ('<path d="M120 186 C104 176 82 176 64 182 L64 222 C82 216 104 216 120 226 Z" fill="#FFFFFF"/>'
                 '<path d="M120 186 C136 176 158 176 176 182 L176 222 C158 216 136 216 120 226 Z" fill="#F4EEFF"/>'
                 '<path d="M120 186 L120 226" stroke="#D9CCFF" stroke-width="3"/>'
                 '<path d="M60 182 L60 226 C80 220 104 220 120 230 C136 220 160 220 180 226 L180 182" stroke="#2F80ED" stroke-width="6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>'
                 '<path d="M76 192 L106 192 M76 202 L102 202 M134 192 L164 192 M138 202 L164 202" stroke="#C9BDF2" stroke-width="3" stroke-linecap="round"/>'
                 f'<circle cx="66" cy="200" r="10.5" fill="{HAND}"/><circle cx="174" cy="200" r="10.5" fill="{HAND}"/>')
        css = (".body{transform-box:view-box;transform-origin:120px 240px;animation:sway 3.2s ease-in-out infinite}"
               "@keyframes sway{0%,100%{transform:rotate(0)}50%{transform:rotate(2deg)}}")
    elif name == "celebrate":
        back = arm(58, 146, 26, 120, 36, 78) + arm(182, 146, 214, 120, 204, 78)
        e, m = "happy", "open"
        conf = [("#FFB020", 20, 40, 20), ("#FF6B57", 60, 22, -30), ("#2EC27E", 186, 26, 35),
                ("#2F80ED", 224, 50, -15), ("#FF6B57", 230, 96, 40), ("#2F80ED", 14, 110, 25)]
        extra_back = '<g class="conf">' + "".join(
            f'<rect x="{x - 6}" y="{y - 3}" width="12" height="6" rx="2" fill="{c}" transform="rotate({r} {x} {y})"/>' for c, x, y, r in conf)
        extra_back += '<circle cx="40" cy="20" r="4" fill="#2EC27E"/><circle cx="206" cy="10" r="4" fill="#FFB020"/></g>'
        css = (".body{animation:hop 1s cubic-bezier(.3,0,.3,1) infinite}"
               "@keyframes hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-10px)}}"
               ".conf{animation:pop 1s ease-in-out infinite}@keyframes pop{0%,100%{opacity:1}50%{opacity:.55}}")
    elif name == "sleep":
        e, m = "closed", "o"
        extra_front = (f'<g class="zz"><path d="M190 46 h18 l-18 22 h18" stroke="{BODY}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round" fill="none"/>'
                       f'<path d="M216 26 h11 l-11 13 h11" stroke="{HI}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" fill="none"/></g>')
        css = (".body{transform-box:view-box;transform-origin:120px 238px;animation:breathe 3s ease-in-out infinite}"
               "@keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.025,.985)}}"
               ".zz{animation:zz 3s ease-in-out infinite}@keyframes zz{0%,100%{transform:translateY(0);opacity:1}50%{transform:translateY(-6px);opacity:.6}}")
    elif name == "heart":
        back = arm(58, 160, 44, 190, 96, 194) + arm(182, 160, 196, 190, 144, 194)
        e, m = "happy", "smile"
        front = ('<g class="heart"><path d="M120 222 C96 206 84 194 84 180 C84 168 94 160 104 160 C112 160 117 165 120 170 '
                 'C123 165 128 160 136 160 C146 160 156 168 156 180 C156 194 144 206 120 222 Z" fill="#FF6B57"/>'
                 '<ellipse cx="100" cy="174" rx="6" ry="4" fill="#fff" opacity=".55" transform="rotate(-30 100 174)"/></g>'
                 f'<circle cx="92" cy="192" r="10.5" fill="{HAND}"/><circle cx="148" cy="192" r="10.5" fill="{HAND}"/>')
        css = (".heart{transform-box:fill-box;transform-origin:center;animation:beat 1.4s ease-in-out infinite}"
               "@keyframes beat{0%,100%{transform:scale(1)}15%{transform:scale(1.12)}30%{transform:scale(1)}45%{transform:scale(1.08)}}")
    elif name == "think":
        back = arm(58, 166, 36, 186, 42, 208)
        front = (f'<path d="M184 168 Q196 186 160 190" stroke="{LIMB}" stroke-width="15" stroke-linecap="round" fill="none"/>'
                 f'<circle cx="152" cy="188" r="10.5" fill="{HAND}"/>')
        look, m = (4, -6), "small"
        extra_front = (f'<g class="dots"><circle cx="196" cy="62" r="7" fill="{HI}"/><circle cx="214" cy="40" r="9" fill="{HI}"/>'
                       f'<circle cx="232" cy="16" r="11" fill="{HI}"/></g>')
        css = (".dots{animation:pop 1.6s ease-in-out infinite}@keyframes pop{0%,100%{opacity:1}50%{opacity:.4}}")
    inner = (SHADOW + extra_back + f'<g class="{body_cls}">' + FEET + back + TOP + BODY_SHAPE
             + eyes(e, look) + CHEEKS + mouth(m) + front + "</g>" + extra_front)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="Rebi">'
            f'{style(css)}{DEFS}{inner}</svg>')


def face():
    """Rebi without arms/feet, tight crop: logo mark."""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="34 14 172 230">{DEFS}'
            + TOP + BODY_SHAPE + eyes("open") .replace(' class="blink"', "") + CHEEKS + mouth("smile") + "</svg>")


def icon():
    """App icon: Rebi's face on a soft grape tile."""
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">'
            f'{DEFS}<rect width="256" height="256" rx="56" fill="#EEE8FF"/>'
            '<g transform="translate(-4 -25) scale(1.1)">' + TOP + BODY_SHAPE + eyes("open").replace(' class="blink"', "")
            + CHEEKS + mouth("smile") + "</g></svg>")


POSES = ["wave", "point", "read", "celebrate", "sleep", "heart", "think"]
for p in POSES:
    with open(os.path.join(OUT, f"{p}.svg"), "w") as f:
        f.write(pose(p))
with open(os.path.join(OUT, "face.svg"), "w") as f:
    f.write(face())
with open(os.path.join(ROOT, "src", "app", "icon.svg"), "w") as f:
    f.write(icon())
print("wrote", len(POSES) + 2, "files")
