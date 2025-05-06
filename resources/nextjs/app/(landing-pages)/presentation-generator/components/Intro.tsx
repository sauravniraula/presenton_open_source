import Wrapper from "@/components/Wrapper";
import React from "react";
import styles from "./Intro.module.css";

const Intro = () => {
  return (
    <Wrapper>
      <div className="max-w-[1280px] mx-auto py-8 md:py-12 lg:py-16">
        <h1 className="text-[28px] lg:text-[44px] xl:text-[56px] leading-[30px] md:leading-[40px] lg:leading-[60px] font-switzer sm:w-[55%] mx-auto text-center font-extrabold">
          Turn Your Ideas into{" "}
          <span className={styles.flipContainer}>
            <span className={styles.flipper}>
              <span className={styles.front}>Stunning Presentations</span>
              <span className={styles.back}>Pitch-Winning Decks</span>
              <span className={styles.back}>Office-Ready Slides</span>
              <span className={styles.back}>Class Toppers' Project</span>
              {/* <span className={styles.back}>Beautiful Slideshows</span>
              <span className={styles.back}>Smart Visual Stories</span> */}
            </span>
          </span>
        </h1>
        <p className="text-[#444] font-satoshi text-center text-[12px] md:text-[15px] lg:text-[20px] font-[400] leading-[27px] my-6  sm:w-[55%] mx-auto">
          No more struggling with slides. Just drop your content and let your AI
          buddy craft beautiful, ready-to-share presentations for work, study,
          or business — in minutes.
        </p>
        <a
          href="https://www.producthunt.com/posts/presenton-data-presentations?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-presenton&#0045;data&#0045;presentations"
          target="_blank"
        >
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=784122&theme=light&t=1736879343037"
            alt="Presenton&#0058;&#0032;Data&#0032;Presentations - Generate&#0032;presentation&#0032;from&#0032;data&#0032;reports&#0032;and&#0032;dashboard&#0032;images | Product Hunt"
            style={{ width: 250, height: 54, margin: "0 auto" }}
            width="250"
            height="54"
          />
        </a>
      </div>
    </Wrapper>
  );
};

export default Intro;
