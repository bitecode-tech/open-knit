import * as React from "react";

interface BitecodeHeroProps {
    avatarUrls?: string[];
}

const BitecodeHero: React.FC<BitecodeHeroProps> = ({avatarUrls = []}) => {
    return (
        <section
            className="flex flex-col justify-center items-center px-0 py-20 mx-auto w-full max-w-none bg-slate-900 max-md:max-w-[991px] max-sm:max-w-screen-sm"
            aria-labelledby="hero-heading"
        >
            <div className="flex flex-col gap-7 px-20 py-0 w-full max-w-[720px] max-md:px-10 max-md:py-0 max-sm:px-5 max-sm:py-0">
                <h1 className="text-2xl font-semibold text-zinc-100">Bitecode</h1>

                <div className="flex flex-col gap-3 items-center w-full">
                    <h2
                        id="hero-heading"
                        className="text-4xl font-extrabold leading-9 text-zinc-100 max-md:text-3xl max-sm:text-3xl"
                    >
                        Explore the future of financial freedom.
                    </h2>
                    <p className="text-base leading-6 text-gray-200 max-md:text-sm max-sm:text-xs">
                        Discover a secure, modern way to manage your finances — trusted by
                        thousands for fast, transparent, and bulletproof-safe transactions.
                        Your money, your rules — powered by the future of finance.
                    </p>
                </div>

                <div className="flex gap-6 items-center w-full">
                    <SocialProofAvatars avatarUrls={avatarUrls}/>
                    <div className="w-px bg-blue-500 h-[29px]" aria-hidden="true"/>
                    <div className="flex items-center text-sm text-gray-300 gap-1">
                        <span>Rated Best Over</span>
                        <span className="font-bold text-zinc-100">
              5.7k
            </span>
                        <span>Reviews</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

interface SocialProofAvatarsProps {
    avatarUrls: string[];
}

/**
 * Component to display overlapping user avatars for social proof
 */
const SocialProofAvatars: React.FC<SocialProofAvatarsProps> = ({
                                                                   avatarUrls,
                                                               }) => {
    return (
        <div
            className="flex relative w-20 h-[34px]"
            aria-label={`${avatarUrls.length} user avatars`}
        >
            {avatarUrls.map((url, index) => (
                <img
                    key={index}
                    src={url}
                    alt={`User avatar ${index + 1}`}
                    className={`absolute w-8 h-8 rounded-full ${
                        index > 0 ? "border border-blue-600 border-solid" : ""
                    }`}
                    style={{left: `${index * 16}px`}}
                />
            ))}
        </div>
    );
};

export default BitecodeHero;