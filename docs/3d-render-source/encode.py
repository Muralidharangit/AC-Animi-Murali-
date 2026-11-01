import sys,os
from multiprocessing import Pool
from PIL import Image
OUT,R=sys.argv[1],sys.argv[2];W,H=2200,1146
os.makedirs(f'{R}/img/ac3d',exist_ok=True);os.makedirs(f'{R}/img/ac3d-mobile',exist_ok=True)
def f(n):
    p=f'{OUT}/{n}';i=int(n.split('.')[0])
    im=Image.frombytes('RGBA',(W,H),open(p,'rb').read()).transpose(Image.FLIP_TOP_BOTTOM)
    im.save(f'{R}/img/ac3d/{i:03d}.webp',quality=88,alpha_quality=90,method=4)
    im.resize((1100,573),Image.LANCZOS).save(f'{R}/img/ac3d-mobile/{i:03d}.webp',quality=80,alpha_quality=85,method=4)
    os.remove(p)
if __name__=='__main__':
    names=[n for n in os.listdir(OUT) if n.endswith('.rgba')]
    with Pool(10) as p:p.map(f,names)
    print('encoded',len(names))
