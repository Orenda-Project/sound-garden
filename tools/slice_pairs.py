#!/usr/bin/env python3
"""python3 tools/slice_pairs.py SLICE ROUND -> builds /tmp/sgcrit/<slice>_r<round>/ pairs of Sound Garden screens vs Sound Out's current screens."""
import sys, re, glob, subprocess, pathlib
H = pathlib.Path.home() / 'Documents/free_work'
SG = H / 'sound-garden-port/tools/so-compat/app/shots'; SHOT = pathlib.Path('/tmp/sgshots'); SO = H / 'sound-out/app/shots'
def so_like(name):
    core = re.sub(r'^[AB]_\d+_', '', name)
    c = [f for f in sorted(SO.glob(f'A_*_{core}')) if re.match(r'A_\d+_', f.name)]
    return c[-1] if c else None
def sg(core): 
    c = sorted(SG.glob(f'A_*_{core}.png')); return c[-1] if c else None
slices = {
 'teach': [('who-is-reading', 'hear-A_new_sound', 'hear-Your_turn', 'meet-This_letter_makes_that_s', 'trace-Trace_the_letter', 'blend-Blend_it', 'gate-1-options', 'gate-2-repair', 'end-A', 'read-Read_it', 'check-Show_what_you_know', 'end-X', 'tricky-Tricky_word')],
}
sel = sys.argv[1]; rnd = sys.argv[2]; out = pathlib.Path(f'/tmp/sgcrit/{sel}_r{rnd}')
pairs = []
if sel == 'teach':
    for core in slices['teach'][0]:
        a = sg(core + ''); b = so_like(f'A_00_{core}.png')
        if a and b: pairs.append(f'{a}={b}')
        else: print('no pair for', core, a, b)
    pairs.append(f'{SHOT}/home1.png={SO}/A_12_home.png')
elif sel == 'practice':
    pairs = [f'{SHOT}/practiceA.png={SO}/practice/A_2_hub.png', f'{SHOT}/traceA.png={SO}/practice/A_3_trace.png', f'{SHOT}/practiceB.png={SO}/practice/B_2_hub.png']
elif sel == 'sayit':
    pairs = [f'{SHOT}/sayitA.png={H}/sound-out/docs/screenshots/31_sayit.jpg']
elif sel == 'pdf':
    pairs = [f'{SHOT}/teach.png={H}/sound-out/plan/guide-teach/shots/p-1.png']
elif sel == 'onboard':
    pairs = [f'{SG}/A_01_who-is-reading.png={H}/sound-out/docs/screenshots/02_who.jpg', f'{SG}/A_03_look.png={H}/sound-out/docs/screenshots/04_tilo_colour.jpg', f'{SG}/A_11_done.png={H}/sound-out/docs/screenshots/06_celebration.jpg', f'{SHOT}/home0.png={H}/sound-out/docs/screenshots/08_home.jpg']
elif sel == 'garden':
    pairs = [f'{SHOT}/home2.png={H}/sound-out/docs/screenshots/09_garden.jpg', f'{SHOT}/homeB.png={H}/sound-out/docs/screenshots/23_b_home.jpg', f'{SHOT}/end1.png={SO}/A_17_end-A.png']
subprocess.run([sys.executable, str(H / 'sound-garden-port/tools/critic_pairs.py'), str(out), *pairs], check=True)
