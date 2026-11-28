#!/usr/bin/env python3
"""Make the test copies of Critical: one file with the whole app inline plus a window.__T hook
that the tests use to reach inside. Written to tests/.out/ (ignored by git).
    python3 tests/make_copy.py
"""
import os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(R, 'tests', '.out')
os.makedirs(OUT, exist_ok=True)
s = open(os.path.join(R, 'critical.src.html'), encoding='utf-8').read()
a = "checkBadges(true);quests();updHeader();showPage('learn');"
assert s.count(a) == 1, 'startup line not found: update tests/make_copy.py'
s = s.replace(a, 'window.__T=function(){return {S:S,save:save,UNITS:UNITS,trk:trk,P:function(){return P},TESTS:TESTS,CGEN:CGEN,WIDGETS:WIDGETS,fxAn:fxAn,fxJudgeT:fxJudgeT,fxLessonEqs:fxLessonEqs,glossBuild:glossBuild,renderLearn:function(){return renderLearn()},startLesson:startLesson,show:function(i){if(i!=null)P.i=i;return showCard()},showCard:function(){return showCard()},finish:function(){return finish()},showPage:showPage,ideaMem:ideaMem,ideasDue:ideasDue,ideaReview:ideaReview,lxSet:lxSet,plogAdd:plogAdd,symAll:symAll,symMem:symMem,symDue:symDue,symReview:symReview,lxSet:lxSet,gymGo:gymGo,gymOpen:gymOpen,nbList:nbList,nbOpen:nbOpen,warmGo:warmGo,cheatOpen:cheatOpen,resOpen:resOpen,monOpen:monOpen,projsOpen:projsOpen,GYM_RR:GYM_RR,lxGet:lxGet,ideaMem:ideaMem,MIS:MIS,LABEL:LABEL,CMAP:CMAP,LONGQ:LONGQ,DIAS:DIAS,ttsText:ttsText,nextCard:function(){return nextCard()},goList:goList,goCards:goCards,goStart:goStart}};window.showPage=showPage;window.closePlayer=closePlayer;' + a)
for n in ['smart_copy', 'qm_copy', 'mq_copy', 'pace_copy', 'eq_copy']:
    open(os.path.join(OUT, n + '.html'), 'w', encoding='utf-8').write(s)
print('test copies written to tests/.out/')
