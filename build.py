import os
import glob
import shutil
from jinja2 import Environment, FileSystemLoader
from loguru import logger


class Jinjapocalypse:
    def __init__(self, src_folder="src", build_folder="build", media_folder="media"):
        self.src_folder = src_folder
        self.build_folder = build_folder
        self.media_folder = media_folder
        self.context = {"src": {}}

    def render_template(self, template_path):
        template_path = "src/" + template_path
        env = Environment(
            loader=FileSystemLoader(os.path.dirname(template_path)),
            trim_blocks=True,
            block_start_string="/o/",
            block_end_string="\\o\\",
            variable_start_string="\o/",
            variable_end_string="\o/",
        )
        template = env.get_template(os.path.basename(template_path))
        return template.render(self.context)

    def copy_files(self, source_folder, destination_folder):
        shutil.copytree(source_folder, destination_folder, dirs_exist_ok=True)

    def process_files(self):
        os.makedirs(self.build_folder, exist_ok=True)
        src_files = [f[len(self.src_folder) + 1 :] for f in list(glob.glob(os.path.join(self.src_folder, "*")))]

        for src_file in src_files:
            logger.info(f"Found {src_file}...")
            with open("src/" + src_file, "r") as file:
                content = file.read()
                self.context["src"][src_file] = content

        for src_file in src_files:
            if self.context["src"][src_file].startswith("!norender"):
                rendered_content = self.context["src"][src_file]
            else:
                logger.info(f"Rendering {src_file}")
                rendered_content = self.render_template(src_file)

            build_file = os.path.join(self.build_folder, os.path.relpath("src/" + src_file, self.src_folder))
            with open(build_file, "w") as build_file:
                build_file.write(rendered_content)
                logger.info(f"Wrote {build_file.name}")

        logger.info("Copying media files ...")
        self.copy_files(self.media_folder, os.path.join(self.build_folder, self.media_folder))
        logger.info("All done")


if __name__ == "__main__":
    jinjapocalypse_instance = Jinjapocalypse()
    jinjapocalypse_instance.process_files()
