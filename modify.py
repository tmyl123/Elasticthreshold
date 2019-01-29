#!/usr/bin/python3
import sys

f=open('[IPT]-MO010-IN-Above.json', 'r')
flist=f.readlines()

print('原本:')
print(flist[16])

flist[16]='  "extraMailBody": "incoming超量,請檢查是否為正常流量",'

f=open('[IPT]-MO010-IN-Above.json', 'w')
f.writelines(flist)
print('修改後:')
print(flist[16])
