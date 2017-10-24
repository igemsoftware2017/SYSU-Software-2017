from ..models import *

GENE = ['CDS', 'RBS', 'promoter', 'composite', 'generator', 'reporter', 'inverter'
        'signalling', 'measurement']

MATERIAL = ['material', 'light', 'protein', 'RNA', 'protein-m', 'protein-l', 'complex']

def simulation(circuit):
    parts = {x.cid: {
        'point': [],
        'type': Parts.objects.get(pk = x.id).Type,
        'device': None,
        'id': x.id
    } for x in circuit['parts']}

    for l in circuit['lines']:
        parts[l['Start']].point.append({
            'cid': l['End'],
            'type': l['Type']
        })

    devices = circuit['devices']

    for d in devices:
        for p in d:
            parts[d]['device'] = d

    material = []
    pro = []
    inhi = []

    for cid in parts:
        part = parts[cid]
        if part['type'] in MATERIAL:
            material.append(cid)
            for pointPart in part['point']:
                if parts[pointPart['cid']]['type'] in MATERIAL:
                    if pointPart['type'] == 'promotion':
                        pro.append([cid, pointPart['cid']])
                    elif pointPart['type'] == 'inhibition':
                        inhi.append([cid, pointPart['cid']])
                elif parts[pointPart['cid']]['type'] in GENE:
