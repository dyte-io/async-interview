import {
  DyteAudioVisualizer,
  DyteAvatar,
  DyteParticipantTile,
  DyteSpinner,
} from '@dytesdk/react-ui-kit';
import {
  DyteProvider,
  useDyteClient,
  useDyteMeeting,
  useDyteSelector,
} from '@dytesdk/react-web-core';
import { useEffect, useState } from 'react';

const questions = [
  'https://res.cloudinary.com/doy3ks7ls/video/upload/v1680075287/Intro_xb5ftf.mp4',
  'https://res.cloudinary.com/doy3ks7ls/video/upload/v1680075215/Question_1_rwml32.mp4',
  'https://res.cloudinary.com/doy3ks7ls/video/upload/v1680075219/Question_2_yeddjq.mp4',
  'https://res.cloudinary.com/doy3ks7ls/video/upload/v1680075219/Question_3_kqgbgw.mp4',
];

function Interview() {
  const roomJoined = useDyteSelector((m) => m.self.roomJoined);
  const [stage, setStage] = useState(0);
  const { meeting } = useDyteMeeting();

  const recordingState = useDyteSelector((m) => m.recording.recordingState);

  if (!roomJoined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-full w-full">
      <aside className="relative flex-1">
        <video
          className="h-full w-full object-cover"
          src={questions[stage]}
          controls
          autoPlay
        />
      </aside>
      <main className="flex flex-1 flex-col items-center justify-center gap-12 p-4">
        {stage !== 0 && stage !== 3 && (
          <>
            <DyteParticipantTile
              participant={meeting.self}
              className="relative aspect-[4/3] h-auto w-full max-w-[540px]"
            >
              <DyteAudioVisualizer
                participant={meeting.self}
                size="lg"
                className="absolute right-3 top-3"
              />
              <DyteAvatar participant={meeting.self} />
            </DyteParticipantTile>

            <p className="rounded-md border border-blue-500 px-4 py-2 text-blue-600">
              Speak when the recording has started, you will see the indicator
              above.
            </p>
          </>
        )}

        {stage === 0 && (
          <p>Hello, click Start when you are ready to proceed.</p>
        )}

        {stage > 0 && recordingState === 'STARTING' && (
          <p className="info">
            <DyteSpinner />
            Starting the recording...
          </p>
        )}

        {stage > 0 && recordingState === 'RECORDING' && (
          <p className="info border-red-500 text-red-700">
            Recording has started, you can start speaking now
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {stage > 0 && stage < 3 && recordingState === 'IDLE' && (
            <button
              className="btn bg-red-500"
              onClick={() => meeting.recording.start()}
            >
              Start Recording
            </button>
          )}

          {stage === 0 && (
            <button
              className="btn"
              onClick={() => {
                setStage(1);
              }}
            >
              Start
            </button>
          )}

          {stage === 1 && (
            <button
              className="btn"
              onClick={async () => {
                if (recordingState === 'RECORDING') {
                  await meeting.recording.stop();
                  setStage(2);
                }
              }}
              disabled={recordingState !== 'RECORDING'}
            >
              Next
            </button>
          )}
          {stage === 2 && (
            <button
              className="btn"
              onClick={() => {
                if (recordingState === 'RECORDING') {
                  meeting.recording.stop();
                }
                setStage(3);
              }}
            >
              Finish
            </button>
          )}

          {stage === 3 && (
            <div>
              <p className="max-w-md text-center text-2xl font-semibold">
                Thank you for attending the interview. Your responses were
                recorded.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function InterviewPage() {
  const [meeting, initMeeting] = useDyteClient();

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);

    const authToken = search.get('authToken');

    if (!authToken) {
      return alert('authToken was not passed');
    }

    initMeeting({
      authToken,
    }).then((m) => m?.joinRoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log({ initMeeting });
  }, [initMeeting]);

  return (
    <DyteProvider value={meeting} fallback={<div>Loading...</div>}>
      <Interview />
    </DyteProvider>
  );
}
