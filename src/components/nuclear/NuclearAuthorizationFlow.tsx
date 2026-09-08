import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { SovietButton } from '../ui/SovietButton';
import { SovietCard } from '../ui/SovietCard';
import { escalateNuclearLevel, generateTargetPackage, generateStavkaOpinions, executeNuclearStrike, abortNuclearProtocol } from '../../engine/nuclearEngine';
import { NuclearStrikeType } from '../../types/nuclear';

export const NuclearAuthorizationFlow: React.FC = () => {
  const { nuclear, setNuclearState, addLog, setPhase } = useGameStore();
  const [confirmed1, setConfirmed1] = useState(false);
  const [confirmed2, setConfirmed2] = useState(false);

  const handleEscalate = () => {
    escalateNuclearLevel();
  };

  const handleGenerateTargets = () => {
    const targets = generateTargetPackage();
    setNuclearState({
      authorizationStage: 'target-package',
      targetPackage: { targets },
    });
    addLog({
      category: 'nuclear',
      title: '目标包生成',
      content: `系统已生成${targets.length}个虚构打击目标。`,
      tone: 'horror',
    });
  };

  const handleSelectTarget = (targetId: string) => {
    setNuclearState({
      targetPackage: { ...nuclear.targetPackage!, selectedTargetId: targetId },
    });
  };

  const handleStavkaReview = () => {
    const opinions = generateStavkaOpinions();
    setNuclearState({
      authorizationStage: 'stavka-review',
      stavkaOpinions: opinions,
    });
    addLog({
      category: 'nuclear',
      title: '总参争论',
      content: '总参谋部、前线司令和政治委员就是否使用核武器展开激烈争论。',
      tone: 'horror',
    });
  };

  const handleDualConfirm = () => {
    setNuclearState({ authorizationStage: 'dual-confirmation' });
    setConfirmed1(false);
    setConfirmed2(false);
  };

  const handleFinalWindow = () => {
    if (confirmed1 && confirmed2) {
      setNuclearState({
        authorizationStage: 'final-window',
        countdown: 30,
        irreversible: false,
      });
    }
  };

  const handleExecute = (strikeType: NuclearStrikeType) => {
    const targetId = nuclear.targetPackage?.selectedTargetId;
    if (!targetId) return;

    setNuclearState({ irreversible: true });
    executeNuclearStrike(targetId, strikeType);
    setPhase('crisis');
  };

  const handleAbort = () => {
    abortNuclearProtocol();
    setConfirmed1(false);
    setConfirmed2(false);
  };

  const stages = [
    { id: 'warning', label: '核预警提升', active: nuclear.authorizationStage === 'warning' },
    { id: 'target-package', label: '目标包生成', active: nuclear.authorizationStage === 'target-package' },
    { id: 'stavka-review', label: '总参意见', active: nuclear.authorizationStage === 'stavka-review' },
    { id: 'dual-confirmation', label: '双重确认', active: nuclear.authorizationStage === 'dual-confirmation' },
    { id: 'final-window', label: '最后中止窗口', active: nuclear.authorizationStage === 'final-window' },
  ];

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex gap-2">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className={`flex-1 text-center py-2 text-xs font-mono border ${
              stage.active
                ? 'border-soviet-red bg-soviet-red/20 text-soviet-redBright'
                : 'border-soviet-gray/20 text-soviet-gray/40'
            }`}
          >
            {stage.label}
          </div>
        ))}
      </div>

      {/* Stage Content */}
      {nuclear.authorizationStage === 'warning' && (
        <SovietCard title="核预警提升" variant="danger">
          <p className="text-sm font-mono text-soviet-gray mb-4">
            提升核预警等级将使外交压力和敌方戒备急剧上升。此操作不可撤销。
          </p>
          <div className="flex gap-3">
            <SovietButton onClick={handleEscalate} variant="danger">
              提升预警等级
            </SovietButton>
            <SovietButton onClick={handleAbort} variant="default">
              中止流程
            </SovietButton>
          </div>
        </SovietCard>
      )}

      {nuclear.authorizationStage === 'target-package' && (
        <SovietCard title="目标包生成" variant="danger">
          <div className="text-sm font-mono text-soviet-gray mb-4">
            系统已生成以下虚构打击目标（无现实坐标）：
          </div>
          <div className="space-y-2 mb-4">
            {nuclear.targetPackage?.targets.map((t) => (
              <div
                key={t.id}
                onClick={() => handleSelectTarget(t.id)}
                className={`p-2 border cursor-pointer text-xs font-mono ${
                  nuclear.targetPackage?.selectedTargetId === t.id
                    ? 'border-soviet-red bg-soviet-red/20 text-soviet-redBright'
                    : 'border-soviet-gray/30 text-soviet-gray hover:bg-soviet-gray/10'
                }`}
              >
                <div className="font-bold">{t.name}</div>
                <div className="text-soviet-gray/60">{t.description}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <SovietButton
              onClick={handleStavkaReview}
              variant="danger"
              disabled={!nuclear.targetPackage?.selectedTargetId}
            >
              提交总参审查
            </SovietButton>
            <SovietButton onClick={handleAbort} variant="default">
              中止流程
            </SovietButton>
          </div>
        </SovietCard>
      )}

      {nuclear.authorizationStage === 'stavka-review' && (
        <SovietCard title="总参意见" variant="danger">
          <div className="space-y-3 mb-4">
            {nuclear.stavkaOpinions?.map((op, i) => (
              <div key={i} className="border border-soviet-gray/30 p-3">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-soviet-gray">{op.role} — {op.name}</span>
                  <span className={
                    op.stance === 'support' ? 'text-soviet-red' : op.stance === 'oppose' ? 'text-soviet-green' : 'text-soviet-amber'
                  }>
                    {op.stance === 'support' ? '支持' : op.stance === 'oppose' ? '反对' : '犹豫'}
                  </span>
                </div>
                <div className="text-xs font-mono text-soviet-gray mt-1">{op.argument}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <SovietButton onClick={handleDualConfirm} variant="danger">
              进入双重确认
            </SovietButton>
            <SovietButton onClick={handleAbort} variant="default">
              中止流程
            </SovietButton>
          </div>
        </SovietCard>
      )}

      {nuclear.authorizationStage === 'dual-confirmation' && (
        <SovietCard title="双重确认" variant="danger">
          <div className="text-sm font-mono text-soviet-red mb-4">
            你必须通过两个独立确认步骤才能继续。每一步都会增加核升级风险。
          </div>
          <div className="space-y-3 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed1}
                onChange={(e) => setConfirmed1(e.target.checked)}
                className="accent-soviet-red w-5 h-5"
              />
              <span className="text-xs font-mono text-soviet-gray">
                确认：我理解使用核武器将造成不可逆转的后果
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed2}
                onChange={(e) => setConfirmed2(e.target.checked)}
                className="accent-soviet-red w-5 h-5"
              />
              <span className="text-xs font-mono text-soviet-gray">
                确认：目标为虚构游戏内单位，无现实坐标
              </span>
            </label>
          </div>
          <div className="flex gap-3">
            <SovietButton onClick={handleFinalWindow} variant="danger" disabled={!confirmed1 || !confirmed2}>
              进入最后中止窗口
            </SovietButton>
            <SovietButton onClick={handleAbort} variant="default">
              中止流程
            </SovietButton>
          </div>
        </SovietCard>
      )}

      {nuclear.authorizationStage === 'final-window' && (
        <SovietCard title="最后中止窗口" variant="danger">
          <div className="text-sm font-mono text-soviet-red mb-4">
            倒计时期间允许中止。中止将影响总参信任和指挥完整性。继续将进入不可逆后果。
          </div>
          <div className="flex gap-3 mb-4">
            <SovietButton onClick={() => handleExecute('tactical')} variant="danger">
              执行战术核打击
            </SovietButton>
            <SovietButton onClick={() => handleExecute('area-denial')} variant="danger">
              区域拒止打击
            </SovietButton>
            <SovietButton onClick={() => handleExecute('warning-burst')} variant="warning">
              示警性高空爆炸
            </SovietButton>
          </div>
          <SovietButton onClick={handleAbort} variant="default">
            中止流程
          </SovietButton>
        </SovietCard>
      )}

      {nuclear.authorizationStage === 'executed' && (
        <SovietCard title="打击已执行" variant="danger">
          <div className="text-sm font-mono text-soviet-red">
            {nuclear.lastAction}
          </div>
          <div className="text-xs font-mono text-soviet-gray mt-2">
            等待战场与外交后果结算...
          </div>
        </SovietCard>
      )}
    </div>
  );
};
